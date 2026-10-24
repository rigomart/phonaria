import { parseUploadArguments, runUpload } from "./uploads";

async function main() {
	if (process.argv.slice(2).includes("--help")) {
		console.log(
			"Upload checked, marked batches: --out=path [--out=retakes]... --accent=en-us --voice=jenny [--bucket=rigos-assets] [--dry-run] [--concurrency=8] [--overwrite] [--skip-recorded]",
		);
		return;
	}
	await runUpload(parseUploadArguments(process.argv.slice(2)));
}

void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : "Audio upload failed");
	process.exitCode = 1;
});
