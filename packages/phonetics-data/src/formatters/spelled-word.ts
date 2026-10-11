export type SpelledWordSegment = {
	readonly text: string;
	/** True for the letters that spell the sound. */
	readonly highlighted: boolean;
};

/** Splits a spelling example such as "m[a]k[e]" into plain and highlighted letters. */
export function splitSpelledWord(spelled: string): SpelledWordSegment[] {
	const segments: SpelledWordSegment[] = [];
	for (const [, plain, highlighted] of spelled.matchAll(/([^[\]]*)(?:\[([^[\]]+)\])?/g)) {
		if (plain) segments.push({ text: plain, highlighted: false });
		if (highlighted) segments.push({ text: highlighted, highlighted: true });
	}
	return segments;
}
