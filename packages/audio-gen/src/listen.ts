import path from "node:path";
import { writeListeningPage } from "./listening-page";

const out = process.argv
	.slice(2)
	.find((arg) => arg.startsWith("--out="))
	?.slice(6);
if (!out?.trim()) {
	console.error("Usage: bun run listen --out=<dir>");
	process.exitCode = 1;
} else {
	writeListeningPage(path.resolve(out)).then(
		(file) => console.log(`Open ${file} in a browser to mark each clip.`),
		(error: unknown) => {
			console.error(error instanceof Error ? error.message : "Writing the listening page failed");
			process.exitCode = 1;
		},
	);
}
