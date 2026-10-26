import type { TargetAccent } from "../core/types";
import type { WordAudioManifest } from "../languages/types";

/** One recording of a word; `label` names the meaning or form when the word has several. */
export type WordAudioRecording = { readonly path: string; readonly label?: string };

const wordSets = new WeakMap<WordAudioManifest, ReadonlySet<string>>();

/**
 * Bucket-relative path of a word's main recording in `manifest`, or null when the manifest
 * doesn't list the word. Matching ignores case and surrounding whitespace.
 */
export function findWordAudioPath(
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
 * Every recording of a word in `manifest`, main form first, each labelled when the manifest
 * labels it. A word recorded once has one entry without a label; an unlisted word, none.
 */
export function findWordAudioForms(
	manifest: WordAudioManifest,
	targetAccent: TargetAccent,
	word: string,
): readonly WordAudioRecording[] {
	const normalized = word.toLowerCase().trim();
	const main = findWordAudioPath(manifest, targetAccent, normalized);
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
