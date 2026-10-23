import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type PlanSample = { word: string; form?: unknown; file: string; status: string; sha256?: string };
type Plan = {
	targetAccent: string;
	settings: { voiceId: string };
	samples: PlanSample[];
};

export type WordAudioManifestSource = { voice: string; words: readonly string[] };

/** "en-US-JennyNeural" -> "jenny": the voice's name, lowercase, as its bucket folder. */
export function voiceFolderName(voiceId: string): string {
	const name = voiceId
		.split("-")
		.at(-1)
		?.replace(/Neural$/, "");
	if (!name || !/^[A-Za-z]+$/.test(name))
		throw new Error(`Cannot derive a voice name from "${voiceId}"`);
	return name.toLowerCase();
}

/** The recorded words of a fully generated plan. Refuses any unfinished or unusual sample. */
export function manifestFromPlan(plan: Plan): WordAudioManifestSource {
	const unfinished = plan.samples.filter(({ status, sha256 }) => status !== "generated" || !sha256);
	if (unfinished.length) {
		throw new Error(
			`${unfinished.length} samples are not generated: ${unfinished
				.slice(0, 5)
				.map(({ word }) => word)
				.join(", ")}`,
		);
	}
	const labelled = plan.samples.filter(({ form }) => form !== undefined);
	if (labelled.length) {
		throw new Error(
			`The manifest lists one recording per word, so labelled forms would play without their meaning: ${labelled
				.slice(0, 5)
				.map(({ file }) => file)
				.join(", ")}`,
		);
	}
	const notOgg = plan.samples.filter(({ word, file }) => file !== `audio/${word}.ogg`);
	if (notOgg.length) {
		throw new Error(
			`Only Ogg recordings are published (audio/{word}.ogg); regenerate with --format=ogg: ${notOgg
				.slice(0, 5)
				.map(({ file }) => file)
				.join(", ")}`,
		);
	}
	const words = plan.samples.map(({ word }) => word);
	const invalid = words.filter((word) => !/^[a-z]+$/.test(word));
	if (invalid.length) throw new Error(`Words must be lowercase a-z: ${invalid.join(", ")}`);
	if (new Set(words).size !== words.length) throw new Error("The plan lists a word twice");
	return { voice: voiceFolderName(plan.settings.voiceId), words: words.sort() };
}

/** Per-accent manifest JSON in @phonaria/phonetics-data. */
const MANIFEST_FILES: Record<string, string> = {
	"en-us": "data/en/word-audio.json",
};

export function manifestFile(targetAccent: string): string {
	const file = MANIFEST_FILES[targetAccent];
	if (!file) throw new Error(`No word-audio manifest for accent "${targetAccent}"`);
	return file;
}

export function renderManifestJson(manifest: WordAudioManifestSource): string {
	return `${JSON.stringify({ voice: manifest.voice, words: manifest.words }, null, "\t")}\n`;
}

/** Merge a completed batch into the accent's manifest JSON; refuse a different voice. */
export function writeManifest(outputDir: string, phoneticsDataDir: string): string {
	const plan = JSON.parse(readFileSync(path.join(outputDir, "plan.json"), "utf8")) as Plan;
	const manifest = manifestFromPlan(plan);
	const target = path.join(phoneticsDataDir, manifestFile(plan.targetAccent));
	const existing = JSON.parse(readFileSync(target, "utf8")) as WordAudioManifestSource;
	if (existing.voice !== manifest.voice)
		throw new Error(`Cannot merge voice ${manifest.voice} into ${existing.voice}`);
	const merged = {
		voice: existing.voice,
		words: [...new Set([...existing.words, ...manifest.words])].sort(),
	};
	writeFileSync(target, renderManifestJson(merged));
	return target;
}
