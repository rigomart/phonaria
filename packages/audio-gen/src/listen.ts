import path from "node:path";
import { writeListeningPage } from "./listening-page";
import { REVIEW_SHEET_FILE } from "./review-sheet";

const out = process.argv
	.slice(2)
	.find((arg) => arg.startsWith("--out="))
	?.slice(6);
if (!out?.trim()) {
	console.error("Usage: bun run listen --out=<dir>");
	process.exitCode = 1;
} else {
	writeListeningPage(path.resolve(out)).then(
		({ file, clips, fromSheet }) =>
			console.log(
				`Open ${file} in a browser to mark its ${clips} clips (${fromSheet ? REVIEW_SHEET_FILE : "no sheet yet, so the whole plan"}).`,
			),
		(error: unknown) => {
			console.error(error instanceof Error ? error.message : "Writing the listening page failed");
			process.exitCode = 1;
		},
	);
}
