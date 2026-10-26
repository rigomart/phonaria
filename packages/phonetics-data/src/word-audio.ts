import type { TargetAccent } from "./core/types";
import type { WordAudioManifest } from "./languages/types";

/** One recording of a word; `label` names the meaning or form when the word has several. */
export type WordAudioRecording = { readonly path: string; readonly label?: string };

/**
 * Loads an accent's word-audio manifest, or null for an accent without recordings. Each
 * manifest is a chunk of its own, so a page that bundles this package doesn't carry it.
 */
export function loadWordAudioManifest(
	targetAccent: TargetAccent,
): Promise<WordAudioManifest | null> {
	switch (targetAccent) {
		case "en-us":
			return import("./data/en/word-audio").then(({ EnglishWordAudio }) => EnglishWordAudio);
		default:
			return Promise.resolve(null);
	}
}

const wordSets = new WeakMap<WordAudioManifest, ReadonlySet<string>>();

/**
 * Bucket-relative path (no leading slash) of a word's main recording, e.g.
 * "audio/en-us/words/jenny/seat.ogg", or null when the manifest doesn't list the word.
 * Matching ignores case and surrounding whitespace.
 */
export function getWordAudioPath(
	manifest: WordAudioManifest,
	targetAccent: TargetAccent,
	word: string,
): string | null {
	const normalized = word.toLowerCase().trim();
	let words = wordSets.get(manifest);
	if (!words) wordSets.set(manifest, (words = new Set(manifest.words)));
	if (!words.has(normalized)) return null;
	return `audio/${targetAccent}/words/${manifest.voice}/${normalized}.ogg`;
}

/**
 * Every recording of a word, main form first: a heteronym's meanings ("present tense",
 * "past tense"), or an "also said" form beside the main one. A word recorded once has one
 * entry without a label; a word without a recording, none.
 */
export function getWordAudioForms(
	manifest: WordAudioManifest,
	targetAccent: TargetAccent,
	word: string,
): readonly WordAudioRecording[] {
	const normalized = word.toLowerCase().trim();
	const main = getWordAudioPath(manifest, targetAccent, normalized);
	const forms =
		manifest.forms && Object.prototype.hasOwnProperty.call(manifest.forms, normalized)
			? manifest.forms[normalized]
			: [];
	const mainLabel = forms.find(({ n }) => n === undefined)?.label;
	const folder = `audio/${targetAccent}/words/${manifest.voice}`;
	return [
		...(main ? [mainLabel ? { path: main, label: mainLabel } : { path: main }] : []),
		...forms.flatMap(({ n, label }) =>
			n === undefined ? [] : [{ path: `${folder}/${normalized}--${n}.ogg`, label }],
		),
	];
}
