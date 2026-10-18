import type { WordSource } from "./words";

export function parseArguments(args: string[]) {
	const options: {
		dryRun?: boolean;
		resume?: boolean;
		outputDir?: string;
		words?: string[];
		source?: WordSource;
		limit?: number;
		requestsPerMinute?: number;
		ratePercent?: number;
		audioFormat?: string;
	} = {};
	for (const arg of args) {
		if (arg === "--dry-run") options.dryRun = true;
		else if (arg === "--resume") options.resume = true;
		else if (arg.startsWith("--out=")) {
			options.outputDir = arg.slice(6);
			if (!options.outputDir.trim()) throw new Error("--out needs a directory");
		} else if (arg.startsWith("--source=")) {
			const source = arg.slice(9);
			if (source !== "catalog" && source !== "spelling" && source !== "practice")
				throw new Error("--source must be catalog, spelling or practice");
			options.source = source;
		} else if (arg.startsWith("--words=")) {
			options.words = arg
				.slice(8)
				.split(",")
				.map((word) => word.trim().toLowerCase());
			if (options.words.some((word) => !word))
				throw new Error("--words needs comma-separated words from the selected source");
		} else if (arg.startsWith("--format=")) {
			const value = arg.slice(9);
			if (value !== "mp3" && value !== "ogg") throw new Error("--format must be mp3 or ogg");
			options.audioFormat = value;
		} else if (arg.startsWith("--rate=")) {
			const value = arg.slice(7);
			if (!/^-?\d+$/.test(value)) throw new Error("--rate needs an integer percentage");
			options.ratePercent = Number(value);
		} else if (arg.startsWith("--limit=") || arg.startsWith("--rpm=")) {
			const value = arg.slice(arg.indexOf("=") + 1);
			if (!/^\d+$/.test(value) || Number(value) < 1)
				throw new Error("Limit and requests per minute need positive integers");
			if (arg.startsWith("--limit=")) options.limit = Number(value);
			else options.requestsPerMinute = Number(value);
		} else throw new Error(`Unknown argument: ${arg}`);
	}
	if (options.resume && !options.outputDir)
		throw new Error("--resume requires --out pointing to a saved plan");
	if (options.resume && options.source)
		throw new Error("Resume uses the saved source; omit --source");
	return options;
}
