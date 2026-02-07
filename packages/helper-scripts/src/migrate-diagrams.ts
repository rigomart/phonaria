/**
 * Migrates consonant articulation diagrams from flat `diagrams/` paths to
 * language-namespaced directories (`diagrams/en/`, `diagrams/es/`) in R2.
 *
 * All existing diagrams are English and get copied to `diagrams/en/`.
 * Phonemes with identical articulation in both languages (P, B, K, G, F, S,
 * M, N, L, Y, W, CH) are also copied to `diagrams/es/`.
 * Originals are deleted after successful copies.
 *
 * Uses S3-compatible CopyObject (no download/re-upload).
 *
 * @example
 * // Preview operations without making changes
 * bun migrate-diagrams --dry-run
 *
 * // Execute the migration
 * bun migrate-diagrams
 */
import {
	CopyObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	S3Client,
} from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
	throw new Error(
		"Missing required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME",
	);
}

const dryRun = process.argv.includes("--dry-run");

const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
	credentials: { accessKeyId, secretAccessKey },
});

/** Phoneme file stems that share identical articulation between English and Spanish */
const SHARED_PHONEME_FILES = new Set([
	"P",
	"B",
	"K",
	"G",
	"F",
	"S",
	"M",
	"N",
	"L",
	"Y",
	"W",
	"CH_stop",
	"CH_fricative",
]);

/** Spanish-only phonemes that need diagrams created separately */
const MISSING_SPANISH_DIAGRAMS = ["T", "D", "X", "NY", "RX", "RR", "YH"];

async function listFlatDiagrams(): Promise<string[]> {
	const keys: string[] = [];
	let continuationToken: string | undefined;

	do {
		const response = await s3.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: "diagrams/",
				ContinuationToken: continuationToken,
			}),
		);

		for (const obj of response.Contents ?? []) {
			if (!obj.Key) continue;
			// Skip keys already namespaced under en/ or es/
			if (obj.Key.startsWith("diagrams/en/") || obj.Key.startsWith("diagrams/es/")) continue;
			// Skip the prefix-only key (if any)
			if (obj.Key === "diagrams/") continue;
			keys.push(obj.Key);
		}

		continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
	} while (continuationToken);

	return keys;
}

async function copyObject(sourceKey: string, destKey: string): Promise<void> {
	if (dryRun) {
		console.log(`  [dry-run] COPY ${sourceKey} -> ${destKey}`);
		return;
	}

	await s3.send(
		new CopyObjectCommand({
			Bucket: bucketName,
			CopySource: `${bucketName}/${sourceKey}`,
			Key: destKey,
		}),
	);
}

async function deleteObject(key: string): Promise<void> {
	if (dryRun) {
		console.log(`  [dry-run] DELETE ${key}`);
		return;
	}

	await s3.send(
		new DeleteObjectCommand({
			Bucket: bucketName,
			Key: key,
		}),
	);
}

async function main(): Promise<void> {
	if (dryRun) {
		console.log("=== DRY RUN MODE (no changes will be made) ===\n");
	}

	console.log("Listing flat diagram files...");
	const flatKeys = await listFlatDiagrams();

	if (flatKeys.length === 0) {
		console.log("No flat diagram files found under diagrams/. Nothing to migrate.");
		return;
	}

	console.log(`Found ${flatKeys.length} file(s) to migrate.\n`);

	let movedToEn = 0;
	let copiedToEs = 0;

	for (const key of flatKeys) {
		const filename = key.replace("diagrams/", "");
		const stem = filename.replace(/\.[^.]+$/, "");

		// Copy to en/
		const enKey = `diagrams/en/${filename}`;
		console.log(`${key} -> ${enKey}`);
		await copyObject(key, enKey);
		movedToEn++;

		// Copy shared phonemes to es/
		if (SHARED_PHONEME_FILES.has(stem)) {
			const esKey = `diagrams/es/${filename}`;
			console.log(`${key} -> ${esKey} (shared)`);
			await copyObject(key, esKey);
			copiedToEs++;
		}

		// Delete original
		await deleteObject(key);
	}

	console.log("\n=== Summary ===");
	console.log(`Moved to diagrams/en/: ${movedToEn}`);
	console.log(`Copied to diagrams/es/ (shared): ${copiedToEs}`);
	console.log(`\nSpanish-only diagrams still needed (create and upload manually):`);
	for (const id of MISSING_SPANISH_DIAGRAMS) {
		console.log(`  diagrams/es/${id}.svg`);
	}
}

main().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
