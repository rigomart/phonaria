import path from "node:path";
import { writeManifest } from "./manifest";

const PHONETICS_DATA_DIR = path.resolve(import.meta.dirname, "../../phonetics-data");

function main() {
	const args = process.argv.slice(2);
	const outputDirs = args
		.filter((arg) => arg.startsWith("--out="))
		.map((arg) => arg.slice(6).trim());
	if (!outputDirs.length || outputDirs.some((dir) => !dir) || outputDirs.length !== args.length) {
		throw new Error(
			"Usage: manifest --out=output/<uploaded-batch> [--out=output/<its-retakes>]...",
		);
	}
	const target = writeManifest(
		outputDirs.map((dir) => path.resolve(dir)),
		PHONETICS_DATA_DIR,
	);
	console.log(`Wrote ${target}.`);
}

try {
	main();
} catch (error) {
	console.error(error instanceof Error ? error.message : "Manifest generation failed");
	process.exitCode = 1;
}
