/**
 * Migrates diagram paths from language codes (`diagrams/en/`, `diagrams/es/`)
 * to BCP 47 accent subtags (`diagrams/en-us/`, `diagrams/es-419/`) in R2.
 *
 * For each source prefix the script copies every object to the new prefix,
 * then deletes the original.
 *
 * Uses S3-compatible CopyObject (no download/re-upload).
 *
 * @example
 * // Preview operations without making changes
 * bun migrate-diagrams-to-accent --dry-run
 *
 * // Execute the migration
 * bun migrate-diagrams-to-accent
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

const MIGRATIONS: { from: string; to: string }[] = [
	{ from: "diagrams/en/", to: "diagrams/en-us/" },
	{ from: "diagrams/es/", to: "diagrams/es-419/" },
];

async function listObjects(prefix: string): Promise<string[]> {
	const keys: string[] = [];
	let continuationToken: string | undefined;

	do {
		const response = await s3.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: prefix,
				ContinuationToken: continuationToken,
			}),
		);

		for (const obj of response.Contents ?? []) {
			if (!obj.Key || obj.Key === prefix) continue;
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

	let totalCopied = 0;
	let totalDeleted = 0;

	for (const { from, to } of MIGRATIONS) {
		console.log(`\nListing objects under ${from}...`);
		const keys = await listObjects(from);

		if (keys.length === 0) {
			console.log(`  No objects found under ${from}. Skipping.`);
			continue;
		}

		console.log(`  Found ${keys.length} object(s).`);

		for (const key of keys) {
			const filename = key.slice(from.length);
			const destKey = `${to}${filename}`;

			console.log(`  ${key} -> ${destKey}`);
			await copyObject(key, destKey);
			totalCopied++;

			await deleteObject(key);
			totalDeleted++;
		}
	}

	console.log("\n=== Summary ===");
	console.log(`Copied:  ${totalCopied}`);
	console.log(`Deleted: ${totalDeleted}`);
}

main().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
