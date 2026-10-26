import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";
import { EnglishWordAudio } from "@phonaria/phonetics-data/data/en/word-audio";
import { getExclusionReason, type PronunciationChoice } from "./curated-words";
import {
	AzureNetworkError,
	createAzureProvider,
	getAzureAudioFormat,
	getAzureRate,
	getAzureVoice,
} from "./providers/azure";
import type { TtsInput, TtsOutput, TtsProvider } from "./providers/types";
import { probeReasons } from "./top-10k-probes";
import { formSlug, isFormSlug, wordForms } from "./word-forms";
import {
	buildAzureWordInput,
	getAzureIpa,
	getSyllables,
	stressedOneSyllable,
	type SyllableSource,
} from "./word-inputs";
import {
	collectWordsWithPhonemic,
	getWordPronunciation,
	isCuratedTier,
	type WordSource,
	wordSources,
} from "./words";

export type Sample = {
	word: string;
	form?: { n?: number; label: string };
	variant: string;
	cmuArpa: string;
	ipa: string;
	pairs: { contrast: string; words: readonly string[] }[];
	pronunciationChoice?: PronunciationChoice;
	syllables?: SyllableSource;
	/** Why this one-syllable input writes its stress mark, from `stressedOneSyllable`. */
	stressWritten?: string;
	pickedFor?: readonly string[];
	input: TtsInput;
	file: string;
	status: "planned" | "generated" | "failed";
	sha256?: string;
};
export type Plan = {
	version: 1;
	createdAt: string;
	source?: WordSource;
	targetAccent: "en-us";
	settings: { provider: "azure"; voiceId: string; outputFormat: string; ratePercent?: number };
	/** Plans whose generated samples were left out, relative to this plan's directory. */
	skippedGenerated?: { dir: string; samples: number }[];
	samples: Sample[];
};
type GenerationOptions = {
	outputDir: string;
	dryRun?: boolean;
	resume?: boolean;
	words?: string[];
	source?: WordSource;
	limit?: number;
	skipGenerated?: string[];
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

const ATTEMPTS = 3;
const RETRY_DELAY_MS = 15_000;

/** The files each other plan already generated with this run's settings and requests. */
async function generatedElsewhere(dirs: string[], settings: Plan["settings"], samples: Sample[]) {
	const requests = new Map(samples.map(({ file, input }) => [file, JSON.stringify(input)]));
	const generated = new Map<string, Set<string>>();
	for (const dir of dirs) {
		let plan: Plan;
		try {
			plan = JSON.parse(await readFile(path.join(dir, "plan.json"), "utf8")) as Plan;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT")
				throw new Error(`No plan to skip in ${dir}`);
			throw error;
		}
		if (
			plan.version !== 1 ||
			plan.targetAccent !== "en-us" ||
			JSON.stringify(plan.settings) !== JSON.stringify(settings)
		) {
			throw new Error(`Plan in ${dir} uses a different voice, rate or format than this run`);
		}
		if (!Array.isArray(plan.samples)) throw new Error(`Invalid saved samples in ${dir}`);
		const files = new Set<string>();
		for (const sample of plan.samples) {
			const request = requests.get(sample.file);
			if (sample.status !== "generated" || !request) continue;
			if (JSON.stringify(sample.input) !== request) {
				throw new Error(`${sample.file} in ${dir} was requested differently; don't skip that plan`);
			}
			const file = path.join(dir, sample.file);
			if (!(await exists(file)) || checksum(await readFile(file)) !== sample.sha256) {
				throw new Error(`Completed recording is missing or changed: ${file}`);
			}
			files.add(sample.file);
		}
		generated.set(dir, files);
	}
	return generated;
}

function selectSamples(
	words?: string[],
	limit?: number,
	extension = "mp3",
	source: WordSource = "catalog",
	saved = false,
): Sample[] {
	if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
		throw new Error("Word limit must be a positive integer");
	}
	if (words && (!words.length || new Set(words).size !== words.length)) {
		throw new Error("Choose words from the selected source without duplicates");
	}
	if (!wordSources.includes(source)) throw new Error(`Unknown word source: ${source}`);
	const curated = isCuratedTier(source);
	// A saved plan keeps words the source has excluded since.
	const catalog = collectWordsWithPhonemic(source, saved ? new Set(words) : undefined);
	const probes = source === "top-10k-probes" ? probeReasons() : undefined;
	const byWord = new Map(catalog.map((word) => [word.word, word]));
	const selection = words
		? words.map((word) => {
				const pronunciation = byWord.get(word);
				if (!pronunciation) throw new Error(`Word is not in the ${source} source: ${word}`);
				return pronunciation;
			})
		: catalog;
	return selection.slice(0, limit).flatMap((word) => {
		const options = { allowRuleSyllables: curated };
		const forms = curated ? wordForms[word.word] : undefined;
		const versions = [
			{ pronunciation: word, form: forms?.primary && { label: forms.primary.label } },
			...(forms?.extra ?? []).map(({ variant, label, n }) => ({
				pronunciation: getWordPronunciation(word.word, [variant]),
				form: { n, label },
			})),
		];
		return versions.map(({ pronunciation, form }): Sample => {
			const slug = formSlug(word.word, form && "n" in form ? form.n : undefined);
			if (!isFormSlug(slug)) throw new Error(`Unsafe word filename: ${slug}`);
			const stressWritten = curated ? stressedOneSyllable[slug] : undefined;
			const inputOptions = { ...options, stressOneSyllable: Boolean(stressWritten) };
			return {
				word: word.word,
				...(form ? { form } : {}),
				variant: pronunciation.variant,
				cmuArpa: pronunciation.cmuArpa,
				ipa: getAzureIpa(pronunciation, inputOptions),
				pairs: EnglishPhonemeContrasts.flatMap(({ id, minimalPairs }) =>
					minimalPairs
						.filter(({ words }) => words.includes(word.word))
						.map(({ words }) => ({ contrast: id, words })),
				),
				...(curated
					? {
							pronunciationChoice: form && "n" in form ? undefined : word.pronunciationChoice,
							syllables: getSyllables(pronunciation, { allowRule: true }).source,
							...(stressWritten ? { stressWritten } : {}),
						}
					: {}),
				...(probes ? { pickedFor: probes.get(word.word) } : {}),
				input: { ...buildAzureWordInput(pronunciation, inputOptions), id: slug },
				file: `audio/${slug}.${extension}`,
				status: "planned",
			};
		});
	});
}

/** Why the current code wouldn't plan a saved sample the same way. */
export type PlanChange = {
	/**
	 * `excluded`: the source now leaves the word out (a fragment). `already recorded`: the
	 * manifest lists the word, so the source no longer offers it. `no longer selected`: the
	 * source dropped the word for another reason.
	 */
	readonly kind:
		| "excluded"
		| "already recorded"
		| "no longer selected"
		| "form dropped"
		| "planned differently";
	readonly reason: string;
};

/**
 * Compares a saved plan with what the current code plans for the same words, by file,
 * since a plan that skipped generated samples can hold only some forms of a word.
 * `changed` holds each saved sample the code would no longer plan the same way;
 * `unplanned`, what the code plans for those words that the saved plan doesn't hold.
 * A word the source now excludes is still compared, as the plan saved it.
 */
export function compareWithCurrentCode(
	plan: Pick<Plan, "source" | "samples">,
	extension: string,
): { changed: Map<string, PlanChange>; unplanned: Sample[] } {
	const source = plan.source ?? "catalog";
	const planWords = new Set(plan.samples.map(({ word }) => word));
	const selectable = new Set(collectWordsWithPhonemic(source).map(({ word }) => word));
	const kept = new Set(collectWordsWithPhonemic(source, planWords).map(({ word }) => word));
	const words = [...planWords].filter((word) => kept.has(word));
	const expected = new Map(
		(words.length ? selectSamples(words, undefined, extension, source, true) : []).map((sample) => [
			sample.file,
			sample,
		]),
	);
	const recorded = new Set(EnglishWordAudio.words);
	const changed = new Map<string, PlanChange>();
	for (const sample of plan.samples) {
		const current = expected.get(sample.file);
		expected.delete(sample.file);
		if (!kept.has(sample.word)) {
			changed.set(
				sample.file,
				recorded.has(sample.word)
					? {
							kind: "already recorded",
							reason: `the word-audio manifest already lists "${sample.word}"`,
						}
					: { kind: "no longer selected", reason: `${source} no longer selects "${sample.word}"` },
			);
		} else if (!current) {
			changed.set(sample.file, {
				kind: "form dropped",
				reason: `"${sample.word}" no longer has the form ${sample.file}`,
			});
		} else {
			const { status: _saved, sha256: _sha256, ...saved } = sample;
			const { status: _status, ...now } = current;
			if (JSON.stringify(saved) === JSON.stringify(now)) {
				if (!selectable.has(sample.word))
					changed.set(sample.file, {
						kind: "excluded",
						reason: `${source} now leaves out "${sample.word}": ${getExclusionReason(sample.word) ?? "excluded"}`,
					});
				continue;
			}
			const fields = [...new Set([...Object.keys(saved), ...Object.keys(now)])].filter(
				(field) =>
					JSON.stringify(saved[field as keyof typeof saved]) !==
					JSON.stringify(now[field as keyof typeof now]),
			);
			const changes = `${fields.join(", ") || "field order"} changed`;
			changed.set(sample.file, {
				kind: "planned differently",
				reason: fields.includes("input")
					? `now requests /${now.ipa}/, not /${saved.ipa}/ (${changes})`
					: changes,
			});
		}
	}
	return { changed, unplanned: [...expected.values()] };
}

function reviewSheet(samples: Sample[]): string {
	const columns = [
		"file",
		"word",
		"form",
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
			sample.form?.label ?? "",
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

/**
 * Generate locally; preserve originals and manual review. Never upload. Only a network
 * error is retried, a few times on the same sample; any other failure stops the run.
 */
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
		if (options.source) throw new Error("Resume uses the saved source; omit source");
		if (options.words || options.limit !== undefined || options.skipGenerated?.length)
			throw new Error("Resume uses the saved word selection; omit words, limit and skipped plans");
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
		if (!plan.samples.length) throw new Error("Saved plan has no samples");
		const { changed, unplanned: missing } = compareWithCurrentCode(plan, audioFormat.extension);
		for (const sample of plan.samples) {
			// A saved plan keeps words the source has excluded since, so it can resume.
			const kind = changed.get(sample.file)?.kind;
			if (
				(kind && kind !== "excluded") ||
				!["planned", "generated", "failed"].includes(sample.status)
			) {
				throw new Error(
					`Saved pronunciation or request changed for ${sample.word}; use a new output directory`,
				);
			}
			if (sample.status === "generated") {
				const file = path.join(options.outputDir, sample.file);
				if (!(await exists(file)) || checksum(await readFile(file)) !== sample.sha256) {
					throw new Error(`Completed recording is missing or changed: ${sample.file}`);
				}
			}
		}
		// A form left out of the plan must have been generated by a skipped plan.
		if (missing.length) {
			const skipDirs = (plan.skippedGenerated ?? []).map(({ dir }) =>
				path.resolve(options.outputDir, dir),
			);
			const skipped = await generatedElsewhere(skipDirs, settings, missing);
			const done = new Set([...skipped.values()].flatMap((files) => [...files]));
			const absent = missing.find(({ file }) => !done.has(file));
			if (absent) {
				throw new Error(`Saved plan is missing ${absent.file}; use a new output directory`);
			}
		}
	} else {
		const selected = selectSamples(
			options.words,
			options.limit,
			audioFormat.extension,
			options.source,
		);
		const skipDirs = [...new Set(options.skipGenerated?.map((dir) => path.resolve(dir)))];
		const skipped = await generatedElsewhere(skipDirs, settings, selected);
		const done = new Set([...skipped.values()].flatMap((files) => [...files]));
		plan = {
			version: 1,
			createdAt: new Date().toISOString(),
			...(options.source && options.source !== "catalog" ? { source: options.source } : {}),
			targetAccent: "en-us",
			settings,
			...(skipped.size
				? {
						skippedGenerated: [...skipped].map(([dir, files]) => ({
							dir: path.relative(path.resolve(options.outputDir), dir),
							samples: files.size,
						})),
					}
				: {}),
			samples: selected.filter(({ file }) => !done.has(file)),
		};
		if (!plan.samples.length) throw new Error("Every selected sample is already generated");
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
				let results: TtsOutput[];
				for (let attempt = 1; ; attempt++) {
					try {
						results = await provider.synthesize([sample.input]);
						break;
					} catch (error) {
						if (!(error instanceof AzureNetworkError) || attempt === ATTEMPTS) throw error;
						console.warn(
							`${error.message}; retry ${attempt} of ${ATTEMPTS - 1} in ${RETRY_DELAY_MS / 1000} s`,
						);
						await (options.wait ?? setTimeout)(RETRY_DELAY_MS);
					}
				}
				const result = results[0];
				if (results.length !== 1 || result?.id !== sample.input.id || !result.audio.length) {
					throw new Error(`Missing or mismatched audio for ${sample.input.id}`);
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
