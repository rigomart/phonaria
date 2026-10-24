import path from "node:path";
import { fullDictionaryPronunciations } from "./full-dictionary";
import { REVIEW_SHEET_FILE, writeReviewSheet } from "./review-sheet";

const USAGE = `Usage: bun run sample --out=<dir> [--seed=358] [--force]
       bun run sample --out=<dir> --adopt=<list.tsv> [--force]

Writes the batch's ${REVIEW_SHEET_FILE}: the clips to listen to, each with why it was chosen.
It needs plan.json and checks.json. --adopt takes a hand-built list (a file column, and a
reason or picked_for column) as the sheet. An existing sheet is replaced only with --force.
Paths are relative to packages/audio-gen.`;

export function parseSampleArguments(args: readonly string[]) {
	const options = {
		outputDir: "",
		seed: 358,
		adopt: undefined as string | undefined,
		force: false,
	};
	for (const arg of args) {
		const [flag, value = ""] = arg.split(/=(.*)/s, 2);
		if (flag === "--out" && value.trim()) options.outputDir = value;
		else if (flag === "--adopt" && value.trim()) options.adopt = value;
		else if (flag === "--seed" && /^\d+$/.test(value)) options.seed = Number(value);
		else if (arg === "--force") options.force = true;
		else throw new Error(`Unknown or empty argument: ${arg}\n\n${USAGE}`);
	}
	if (!options.outputDir) throw new Error(`--out is required\n\n${USAGE}`);
	if (options.adopt && args.some((arg) => arg.startsWith("--seed=")))
		throw new Error("An adopted list isn't drawn; omit --seed");
	return options;
}

async function main() {
	const args = process.argv.slice(2);
	if (args.includes("--help")) {
		console.log(USAGE);
		return;
	}
	const options = parseSampleArguments(args);
	const { file, rows } = await writeReviewSheet(path.resolve(options.outputDir), {
		seed: options.seed,
		adopt: options.adopt && path.resolve(options.adopt),
		force: options.force,
		pronunciationsOf: await fullDictionaryPronunciations(),
	});
	const counts = new Map<string, number>();
	for (const { reason } of rows) {
		const key = reason.split(/[;:]/)[0];
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	console.log(`Wrote ${rows.length} clips to ${file}:`);
	for (const [reason, count] of counts) console.log(`  ${String(count).padStart(4)}  ${reason}`);
}

if (import.meta.main) {
	void main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : "Writing the review sheet failed");
		process.exitCode = 1;
	});
}
