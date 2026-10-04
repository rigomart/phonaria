import type { TranscribedSyllable } from "@/lib/types/g2p";

/**
 * How one variant of a word turns into another. Each list has one entry per
 * item of the target variant, in render order: the index of the source item it
 * continues, or null when it is new. Source items no entry points at are gone.
 */
export interface VariantAlignment {
	phonemes: (number | null)[];
	stressMarks: (number | null)[];
	syllableDots: (number | null)[];
}

/**
 * Phonemes are matched by symbol along their longest common subsequence, so
 * shared sounds keep their order. Stress marks pair up with the next unused
 * mark of the same kind; syllable dots pair up by position.
 */
export function alignVariants(
	from: readonly TranscribedSyllable[],
	to: readonly TranscribedSyllable[],
): VariantAlignment {
	return {
		phonemes: alignSequences(phonemeSymbols(from), phonemeSymbols(to)),
		stressMarks: alignStressMarks(stressMarks(from), stressMarks(to)),
		syllableDots: Array.from({ length: Math.max(to.length - 1, 0) }, (_, index) =>
			index < from.length - 1 ? index : null,
		),
	};
}

function phonemeSymbols(syllables: readonly TranscribedSyllable[]): string[] {
	return syllables.flatMap((syllable) => syllable.phonemes.map((phoneme) => phoneme.symbol));
}

function stressMarks(syllables: readonly TranscribedSyllable[]): string[] {
	return syllables
		.map((syllable) => syllable.stress)
		.filter((stress) => stress === "primary" || stress === "secondary");
}

function alignSequences(from: readonly string[], to: readonly string[]): (number | null)[] {
	// Longest common subsequence of from[i..] and to[j..], stored row by row.
	const width = to.length + 1;
	const lengths = new Array<number>((from.length + 1) * width).fill(0);
	const lcs = (i: number, j: number) => lengths[i * width + j] ?? 0;
	for (let i = from.length - 1; i >= 0; i--) {
		for (let j = to.length - 1; j >= 0; j--) {
			lengths[i * width + j] =
				from[i] === to[j] ? lcs(i + 1, j + 1) + 1 : Math.max(lcs(i + 1, j), lcs(i, j + 1));
		}
	}

	const matches = new Array<number | null>(to.length).fill(null);
	let i = 0;
	let j = 0;
	while (i < from.length && j < to.length) {
		if (from[i] === to[j]) {
			matches[j] = i;
			i++;
			j++;
		} else if (lcs(i + 1, j) >= lcs(i, j + 1)) {
			i++;
		} else {
			j++;
		}
	}
	return matches;
}

function alignStressMarks(from: readonly string[], to: readonly string[]): (number | null)[] {
	const used = new Set<number>();
	return to.map((kind) => {
		const match = from.findIndex((candidate, index) => candidate === kind && !used.has(index));
		if (match === -1) return null;
		used.add(match);
		return match;
	});
}
