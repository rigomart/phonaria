export type MergerNoteSegment = {
	readonly text: string;
	/** "word" for an example word, "sound" for an IPA symbol without its slashes. */
	readonly kind: "plain" | "word" | "sound";
};

/** Splits a merger note's text, e.g. "say *cot* with /ɑ/", into plain text, words and sounds. */
export function splitMergerNoteText(text: string): MergerNoteSegment[] {
	const segments: MergerNoteSegment[] = [];
	for (const [, plain, word, sound] of text.matchAll(/([^*/]*)(?:\*([^*/]+)\*|\/([^*/]+)\/)?/g)) {
		if (plain) segments.push({ text: plain, kind: "plain" });
		if (word) segments.push({ text: word, kind: "word" });
		if (sound) segments.push({ text: sound, kind: "sound" });
	}
	return segments;
}
