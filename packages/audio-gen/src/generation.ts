import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";
import {
	createAzureProvider,
	getAzureAudioFormat,
	getAzureRate,
	getAzureVoice,
} from "./providers/azure";
import type { TtsInput, TtsProvider } from "./providers/types";
import { buildAzureWordInput, getAzureIpa } from "./word-inputs";
import { collectWordsWithPhonemic } from "./words";

type Sample = {
	word: string;
	variant: string;
	cmuArpa: string;
	ipa: string;
	pairs: { contrast: string; words: readonly string[] }[];
	input: TtsInput;
	file: string;
	status: "planned" | "generated" | "failed";
	sha256?: string;
};
type Plan = {
	version: 1;
	createdAt: string;
	targetAccent: "en-us";
	settings: { provider: "azure"; voiceId: string; outputFormat: string; ratePercent?: number };
	samples: Sample[];
};
type GenerationOptions = {
	outputDir: string;
	dryRun?: boolean;
	resume?: boolean;
	words?: string[];
	limit?: number;
	voiceId?: string;
	ratePercent?: number;
	audioFormat?: string;
	region?: string;
	requestsPerMinute?: number;
	provider?: TtsProvider;
	wait?: (ms: number) => Promise<unknown>;
};

async function exists(file: string): Promise<boolean> {
	try {
		await access(file);
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
		throw error;
	}
}
const checksum = (audio: Buffer) => createHash("sha256").update(audio).digest("hex");

function selectSamples(words?: string[], limit?: number, extension = "mp3"): Sample[] {
	if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
		throw new Error("Word limit must be a positive integer");
	}
	if (words && (!words.length || new Set(words).size !== words.length)) {
		throw new Error("Choose catalog words without duplicates");
	}
	const catalog = collectWordsWithPhonemic();
	const byWord = new Map(catalog.map((word) => [word.word, word]));
	const selection = words
		? words.map((word) => {
				const pronunciation = byWord.get(word);
				if (!pronunciation) throw new Error(`Word is not in the catalog: ${word}`);
				return pronunciation;
			})
		: catalog;
	return selection.slice(0, limit).map((word) => {
		if (!/^[a-z]+$/.test(word.word)) throw new Error(`Unsafe word filename: ${word.word}`);
		return {
			word: word.word,
			variant: word.variant,
			cmuArpa: word.cmuArpa,
			ipa: getAzureIpa(word),
			pairs: EnglishPhonemeContrasts.flatMap(({ id, minimalPairs }) =>
				minimalPairs
					.filter(({ words }) => words.includes(word.word))
					.map(({ words }) => ({ contrast: id, words })),
			),
			input: buildAzureWordInput(word),
			file: `audio/${word.word}.${extension}`,
			status: "planned",
		};
	});
}

function reviewSheet(samples: Sample[]): string {
	const columns = [
		"file",
		"word",
		"pairs",
		"contrasts",
		"cmu_arpabet",
		"ipa",
		"pronunciation_ok",
		"natural",
		"clean_edges",
		"consistent_level",
		"accepted",
		"notes",
	];
	const rows = samples.map((sample) =>
		[
			sample.file,
			sample.word,
			sample.pairs.map(({ words }) => words.join("/")).join(";"),
			sample.pairs.map(({ contrast }) => contrast).join(";"),
			sample.cmuArpa,
			sample.ipa,
			"",
			"",
			"",
			"",
			"",
			"",
		].join("\t"),
	);
	return `${[columns.join("\t"), ...rows].join("\n")}\n`;
}

/** Generate locally; preserve originals and manual review. Never upload or retry automatically. */
export async function runGeneration(options: GenerationOptions) {
	const rpm = options.requestsPerMinute ?? 20;
	if (!Number.isInteger(rpm) || rpm < 1 || rpm > 600) {
		throw new Error("Requests per minute must be an integer from 1 to 600");
	}
	const ratePercent = getAzureRate(options.ratePercent);
	const audioFormat = getAzureAudioFormat(options.audioFormat);
	const settings: Plan["settings"] = {
		provider: "azure",
		voiceId: getAzureVoice(options.voiceId),
		outputFormat: audioFormat.outputFormat,
		// Omit the unchanged default to keep earlier saved plans resumable.
		...(ratePercent !== 0 ? { ratePercent } : {}),
	};
	const planPath = path.join(options.outputDir, "plan.json");
	let plan: Plan;
	let savedPlanText: string | undefined;
	if (options.resume) {
		if (options.words || options.limit !== undefined)
			throw new Error("Resume uses the saved word selection; omit words and limit");
		savedPlanText = await readFile(planPath, "utf8");
		plan = JSON.parse(savedPlanText) as Plan;
		if (
			plan.version !== 1 ||
			plan.targetAccent !== "en-us" ||
			JSON.stringify(plan.settings) !== JSON.stringify(settings)
		) {
			throw new Error(
				"Saved plan settings differ; use the original voice or a new output directory",
			);
		}
		if (!Array.isArray(plan.samples)) throw new Error("Invalid saved samples");
		const expected = selectSamples(
			plan.samples.map(({ word }) => word),
			undefined,
			audioFormat.extension,
		);
		for (const [index, sample] of plan.samples.entries()) {
			const { status, sha256, ...identity } = sample;
			const { status: _status, ...expectedIdentity } = expected[index];
			if (
				JSON.stringify(identity) !== JSON.stringify(expectedIdentity) ||
				!["planned", "generated", "failed"].includes(status)
			) {
				throw new Error(
					`Saved pronunciation or request changed for ${sample.word}; use a new output directory`,
				);
			}
			if (status === "generated") {
				const file = path.join(options.outputDir, sample.file);
				if (!(await exists(file)) || checksum(await readFile(file)) !== sha256) {
					throw new Error(`Completed recording is missing or changed: ${sample.file}`);
				}
			}
		}
	} else {
		plan = {
			version: 1,
			createdAt: new Date().toISOString(),
			targetAccent: "en-us",
			settings,
			samples: selectSamples(options.words, options.limit, audioFormat.extension),
		};
		if (await exists(planPath))
			throw new Error("Plan already exists; use --resume or a new output directory");
	}
	for (const sample of plan.samples.filter(({ status }) => status !== "generated")) {
		if (await exists(path.join(options.outputDir, sample.file))) {
			throw new Error(
				`Untracked recording exists: ${sample.file}; preserve it and use a new output directory`,
			);
		}
	}
	const pending = plan.samples.filter(({ status }) => status !== "generated");
	const provider =
		!options.dryRun && pending.length
			? (options.provider ??
				createAzureProvider({
					voiceId: settings.voiceId,
					region: options.region,
					ratePercent,
					audioFormat: options.audioFormat,
				}))
			: undefined;
	await mkdir(options.outputDir, { recursive: true });
	const lockPath = path.join(options.outputDir, ".generation.lock");
	try {
		await writeFile(lockPath, `${process.pid}\n`, { flag: "wx" });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST")
			throw new Error("Output is locked by another run; see README for interrupted-run recovery");
		throw error;
	}
	const checkpoint = async () => {
		const temporary = path.join(options.outputDir, "plan.json.tmp");
		await writeFile(temporary, `${JSON.stringify(plan, null, 2)}\n`);
		await rename(temporary, planPath);
	};
	try {
		if (options.resume && (await readFile(planPath, "utf8")) !== savedPlanText) {
			throw new Error(
				"Saved plan changed while starting this run; resume again to read the latest recordings",
			);
		}
		if (!options.resume) {
			await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, { flag: "wx" });
			await writeFile(path.join(options.outputDir, "review.tsv"), reviewSheet(plan.samples), {
				flag: "wx",
			});
		} else if (!(await exists(path.join(options.outputDir, "review.tsv")))) {
			throw new Error("Review sheet is missing; restore it before resuming");
		}
		if (options.dryRun || !provider) return { planned: plan.samples.length, generated: 0 };
		let generated = 0;
		for (const sample of pending) {
			if (generated) await (options.wait ?? setTimeout)(Math.ceil(60_000 / rpm) + 100);
			try {
				const results = await provider.synthesize([sample.input]);
				const result = results[0];
				if (results.length !== 1 || result?.id !== sample.word || !result.audio.length) {
					throw new Error(`Missing or mismatched audio for ${sample.word}`);
				}
				await mkdir(path.join(options.outputDir, "audio"), { recursive: true });
				await writeFile(path.join(options.outputDir, sample.file), result.audio, { flag: "wx" });
				sample.sha256 = checksum(result.audio);
				sample.status = "generated";
				generated++;
				console.log(`Saved ${sample.file}`);
			} catch (error) {
				sample.status = "failed";
				throw error;
			} finally {
				await checkpoint();
			}
		}
		return { planned: plan.samples.length, generated };
	} finally {
		await unlink(lockPath);
	}
}
