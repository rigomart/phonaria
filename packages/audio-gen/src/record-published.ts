import path from "node:path";
import { recordPublished } from "./uploads";

async function main() {
	const args = process.argv.slice(2);
	const outputDirs = args
		.filter((arg) => /^--out=./.test(arg))
		.map((arg) => path.resolve(arg.slice(6)));
	const value = (name: string) =>
		args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
	const accent = value("accent");
	const voice = value("voice");
	if (!outputDirs.length || !accent || !voice || args.length !== outputDirs.length + 2)
		throw new Error(
			"Usage: record-published --out=path [--out=path]... --accent=en-us --voice=jenny",
		);
	await recordPublished({ outputDirs, accent, voice });
}

void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : "Recording the published batch failed");
	process.exitCode = 1;
});
