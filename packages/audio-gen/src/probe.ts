import "dotenv/config";
import path from "node:path";
import { parseArguments } from "./cli";
import { type ProbeStage, runProbes } from "./probes";

async function main() {
	const args = process.argv.slice(2);
	if (args.includes("--help")) {
		console.log(
			"Azure probes: --stage=voices|rates --voices=Aria,Guy --dry-run --out=path --resume --rpm=20",
		);
		return;
	}
	let stage: ProbeStage = "voices";
	let voices: string[] | undefined;
	const common = args.filter((arg) => {
		if (arg.startsWith("--stage=")) {
			const value = arg.slice(8);
			if (value !== "voices" && value !== "rates")
				throw new Error("--stage must be voices or rates");
			stage = value;
			return false;
		}
		if (arg.startsWith("--voices=")) {
			voices = arg
				.slice(9)
				.split(",")
				.map((voice) => voice.trim());
			return false;
		}
		return true;
	});
	const options = parseArguments(common);
	if (
		options.words ||
		options.limit !== undefined ||
		options.ratePercent !== undefined ||
		options.audioFormat !== undefined
	)
		throw new Error(
			"Probe stages define their six words, speeds and MP3 format; omit words, limit, rate and format",
		);
	const outputDir = path.resolve(options.outputDir ?? `output/probes-${stage}-${Date.now()}`);
	const result = await runProbes({
		...options,
		outputDir,
		stage,
		voices,
		requestsPerMinute:
			options.requestsPerMinute ??
			(process.env.AZURE_REQUESTS_PER_MINUTE
				? Number(process.env.AZURE_REQUESTS_PER_MINUTE)
				: undefined),
	});
	console.log(
		`${result.planned} clips planned; ${result.generated} new recordings. Listening page: ${path.join(outputDir, "index.html")}`,
	);
}
void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : "Probe generation failed");
	process.exitCode = 1;
});
