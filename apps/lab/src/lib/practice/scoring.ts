/**
 * Topic-blind scoring for sound-sequence practice.
 *
 * Everything operates in phoneme-ID space: stored CMU pronunciations are
 * normalized to the exact sequences the palette produces (stress digits
 * stripped, variants deduped), and a learner's sequence is judged against
 * them. The scorer returns raw counts only — it knows nothing about topics
 * (e.g. what schwa is); topics filter the per-sound tallies downstream.
 */

/** One step in the alignment between a learner sequence and a reference. */
export type AlignmentOp =
	| { kind: "match"; sound: string }
	| { kind: "substitution"; target: string; source: string }
	| { kind: "omission"; target: string }
	| { kind: "insertion"; source: string };

export interface SoundTally {
	matched: number;
	total: number;
}

export interface WordScore {
	/** Strict equality against a deduped accepted variant. */
	correct: boolean;
	/** The accepted variant the answer was judged against, in palette space. */
	reference: string[];
	/** Index of that variant in the deduped, CMU-ordered accepted list. */
	referenceIndex: number;
	/** Whether more than one deduped accepted variant exists. */
	hasAlternates: boolean;
	/** Full alignment against the chosen reference, in word order. */
	ops: AlignmentOp[];
	/** Count of match ops. */
	matched: number;
	learnerLength: number;
	referenceLength: number;
	/** Per reference sound: how many occurrences the learner matched. */
	tallies: Record<string, SoundTally>;
}

/** Strips the trailing stress digit from a stored phoneme token. */
export function stripStress(token: string): string {
	return token.replace(/[0-2]$/, "");
}

/** Converts one stored CMU pronunciation into a palette-space sequence. */
export function normalizeVariant(cmuVariant: string): string[] {
	return cmuVariant
		.split(" ")
		.filter((token) => token.length > 0)
		.map(stripStress);
}

/**
 * Normalizes every stored variant and dedupes the results, preserving CMU
 * order (first occurrence wins). Variants that differ only in stress
 * collapse; phonemically distinct variants all remain accepted.
 */
export function normalizeAcceptedVariants(cmuVariants: string[]): string[][] {
	const seen = new Set<string>();
	const variants: string[][] = [];
	for (const cmuVariant of cmuVariants) {
		const sequence = normalizeVariant(cmuVariant);
		const key = sequence.join(" ");
		if (!seen.has(key)) {
			seen.add(key);
			variants.push(sequence);
		}
	}
	return variants;
}

/**
 * Aligns a learner sequence against a reference under uniform-cost edit
 * distance (substitution, omission, insertion each cost 1).
 *
 * Deterministic by construction: the backtrace walks from the end of the
 * word and, wherever costs tie, prefers substitution (or match), then
 * omission, then insertion — so identical answers always render identically.
 */
export function alignSequences(learner: string[], reference: string[]): AlignmentOp[] {
	const m = learner.length;
	const n = reference.length;

	// dp[i][j] = edit distance between learner[0..i) and reference[0..j)
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
	for (let i = 1; i <= m; i++) dp[i][0] = i;
	for (let j = 1; j <= n; j++) dp[0][j] = j;
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const subCost = learner[i - 1] === reference[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(dp[i - 1][j - 1] + subCost, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
		}
	}

	const reversed: AlignmentOp[] = [];
	let i = m;
	let j = n;
	while (i > 0 || j > 0) {
		const subCost = i > 0 && j > 0 && learner[i - 1] === reference[j - 1] ? 0 : 1;
		if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + subCost) {
			reversed.push(
				subCost === 0
					? { kind: "match", sound: reference[j - 1] }
					: { kind: "substitution", target: reference[j - 1], source: learner[i - 1] },
			);
			i--;
			j--;
		} else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
			reversed.push({ kind: "omission", target: reference[j - 1] });
			j--;
		} else {
			reversed.push({ kind: "insertion", source: learner[i - 1] });
			i--;
		}
	}
	return reversed.reverse();
}

function editDistance(learner: string[], reference: string[]): number {
	const m = learner.length;
	const n = reference.length;
	let previous = Array.from({ length: n + 1 }, (_, j) => j);
	for (let i = 1; i <= m; i++) {
		const current = new Array<number>(n + 1);
		current[0] = i;
		for (let j = 1; j <= n; j++) {
			const subCost = learner[i - 1] === reference[j - 1] ? 0 : 1;
			current[j] = Math.min(previous[j - 1] + subCost, current[j - 1] + 1, previous[j] + 1);
		}
		previous = current;
	}
	return previous[n];
}

/**
 * Scores a learner's palette sequence against a word's stored CMU
 * pronunciations. A blank answer (empty learner sequence) flows through the
 * ordinary path: every reference sound becomes an omission, 0 matched over
 * the full reference length.
 */
export function scoreWord(learner: string[], cmuVariants: string[]): WordScore {
	const accepted = normalizeAcceptedVariants(cmuVariants);
	if (accepted.length === 0) {
		throw new Error("scoreWord requires at least one accepted pronunciation");
	}

	let referenceIndex = 0;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (let index = 0; index < accepted.length; index++) {
		const distance = editDistance(learner, accepted[index]);
		if (distance < bestDistance) {
			bestDistance = distance;
			referenceIndex = index;
		}
	}

	const reference = accepted[referenceIndex];
	const ops = alignSequences(learner, reference);

	const tallies: Record<string, SoundTally> = {};
	for (const sound of reference) {
		tallies[sound] ??= { matched: 0, total: 0 };
		tallies[sound].total++;
	}
	let matched = 0;
	for (const op of ops) {
		if (op.kind === "match") {
			matched++;
			tallies[op.sound].matched++;
		}
	}

	return {
		correct: bestDistance === 0,
		reference,
		referenceIndex,
		hasAlternates: accepted.length > 1,
		ops,
		matched,
		learnerLength: learner.length,
		referenceLength: reference.length,
		tallies,
	};
}
