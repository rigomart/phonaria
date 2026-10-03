import "dotenv/config";
import path from "node:path";
import catalogConfig from "../catalog-config.json";
import { parseArguments } from "./cli";
import { runGeneration } from "./generation";

async function main() {
	if (process.argv.slice(2).includes("--help")) {
		console.log(
			"Azure word audio: --dry-run --words=seat,seed --limit=24 --out=path --resume --rpm=20 --rate=-10 --format=ogg|mp3",
		);
		return;
	}
	const options = parseArguments(process.argv.slice(2));
	const outputDir = path.resolve(options.outputDir ?? `output/azure-${Date.now()}`);
	const result = await runGeneration({
		...options,
		outputDir,
		voiceId: process.env.AZURE_SPEECH_VOICE ?? catalogConfig.voiceId,
		audioFormat:
			options.audioFormat ?? process.env.AZURE_SPEECH_FORMAT ?? catalogConfig.audioFormat,
		ratePercent:
			options.ratePercent ??
			(process.env.AZURE_SPEECH_RATE_PERCENT
				? Number(process.env.AZURE_SPEECH_RATE_PERCENT)
				: catalogConfig.ratePercent),
		limit: options.limit ?? (process.env.WORDS_LIMIT ? Number(process.env.WORDS_LIMIT) : undefined),
		requestsPerMinute:
			options.requestsPerMinute ??
			(process.env.AZURE_REQUESTS_PER_MINUTE
				? Number(process.env.AZURE_REQUESTS_PER_MINUTE)
				: undefined),
	});
	console.log(
		`${result.planned} words planned; ${result.generated} new recordings. Output: ${outputDir}`,
	);
	console.log("Listen to each word and its pairs, then fill review.tsv.");
}

void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : "Audio generation failed");
	process.exitCode = 1;
});
