import type { TargetAccent } from "./core/types";
import { tokenizePronunciation } from "./languages/en/cmu-arpa";
import type { WordAudioForm, WordAudioManifest } from "./languages/types";

/**
 * One recording of a word; `label` names the meaning or form when the word has several, and
 * `pronunciation` is the one it was generated from, known for words recorded more than once.
 */
export type WordAudioRecording = {
	readonly path: string;
	readonly label?: string;
	readonly pronunciation?: string;
};

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
 * "past tense"), or an "also said" form beside the main one, each with its pronunciation.
 * A word recorded once has one entry with neither; a word without a recording, none.
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
	const mainForm = forms.find(({ n }) => n === undefined);
	const folder = `audio/${targetAccent}/words/${manifest.voice}`;
	return [
		...(main ? [{ path: main, ...(mainForm && described(mainForm)) }] : []),
		...forms.flatMap((form) =>
			form.n === undefined
				? []
				: [{ path: `${folder}/${normalized}--${form.n}.ogg`, ...described(form) }],
		),
	];
}

const described = ({ label, pronunciation }: WordAudioForm) => ({
	...(label ? { label } : {}),
	pronunciation,
});

/**
 * Every unstressed vowel as one token. Only vowels carry a stress digit, so a 0 suffix marks
 * one; audio-gen's form review ignores unstressed vowels the same way (`form-candidates.ts`).
 */
const withUnstressedVowelsAlike = (pronunciation: string) =>
	tokenizePronunciation(pronunciation)
		.map((token) => (token.endsWith("0") ? "0" : token))
		.join(" ");

/**
 * The recording generated from a pronunciation in dictionary notation ("R IX0 K O1 R D"):
 * the one with exactly that pronunciation, else the only one that differs from it just in
 * unstressed vowels (*record* `R AX0 K O1 R D`, *progress* `P R OU0 G R E1 S`). Undefined
 * when none matches, or more than one matches that way.
 */
export function findWordAudioRecording(
	recordings: readonly WordAudioRecording[],
	pronunciation: string,
): WordAudioRecording | undefined {
	const exact = recordings.find((recording) => recording.pronunciation === pronunciation);
	if (exact) return exact;
	const loose = withUnstressedVowelsAlike(pronunciation);
	const alike = recordings.filter(
		(recording) =>
			recording.pronunciation !== undefined &&
			withUnstressedVowelsAlike(recording.pronunciation) === loose,
	);
	return alike.length === 1 ? alike[0] : undefined;
}
