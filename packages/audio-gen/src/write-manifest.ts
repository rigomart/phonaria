import path from "node:path";
import { writeManifest } from "./manifest";

const PHONETICS_DATA_DIR = path.resolve(import.meta.dirname, "../../phonetics-data");

function main() {
	const arg = process.argv.slice(2).find((value) => value.startsWith("--out="));
	if (!arg?.slice(6).trim()) {
		throw new Error("Usage: manifest --out=output/<completed-directory>");
	}
	const target = writeManifest(path.resolve(arg.slice(6)), PHONETICS_DATA_DIR);
	console.log(`Wrote ${target}.`);
}

try {
	main();
} catch (error) {
	console.error(error instanceof Error ? error.message : "Manifest generation failed");
	process.exitCode = 1;
}
