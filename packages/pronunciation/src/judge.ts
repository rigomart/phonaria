import {
	getContrastRegistryForLanguage,
	type PhonemeContrastMatch,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import type {
	MissingSoundEvidence,
	PronunciationEvidence,
	RivalScore,
	SoundEvidence,
	SoundVerdict,
	WordEvidence,
} from "./contract";

export type JudgeMargins = {
	/** How far the target must beat the best rival to be a match. */
	readonly match: number;
	/** How far a contrast partner must beat the target to count as swapped. */
	readonly swap: number;
	/** The target score that is a match when the scorer reported no rivals at all. */
	readonly matchFloor: number;
};

/** Lenient: favors missing a mistake over marking a correct sound wrong. Tuned per scorer in #335. */
export const LENIENT_MARGINS: JudgeMargins = {
	match: 0.05,
	swap: 0.2,
	matchFloor: 0.5,
};

export type JudgeInput = {
	readonly evidence: WordEvidence;
	readonly judgedPhonemeIds: ReadonlySet<PhonemeSymbolId>;
	readonly targetAccent: TargetAccent;
	readonly margins?: JudgeMargins;
};

export type SoundJudgement = {
	/** Position of the sound in the judged pronunciation. */
	readonly position: number;
	readonly phonemeId: PhonemeSymbolId;
	readonly verdict: SoundVerdict;
};

export type WordJudgement = {
	/** The accepted pronunciation the verdicts were judged against. */
	readonly pronunciationIndex: number;
	/** Only sounds in the judged set, one per occurrence. */
	readonly sounds: readonly SoundJudgement[];
};

/** Null when the scorer lined up none of the accepted pronunciations. */
export function judgeWord({
	evidence,
	judgedPhonemeIds,
	targetAccent,
	margins = LENIENT_MARGINS,
}: JudgeInput): WordJudgement | null {
	const pronunciation = bestFittingPronunciation(evidence.pronunciations);
	if (!pronunciation) return null;

	const registry = getContrastRegistryForLanguage(targetAccent) as Partial<
		Record<PhonemeSymbolId, readonly PhonemeContrastMatch[]>
	> | null;

	const sounds: SoundJudgement[] = [];
	pronunciation.sounds.forEach((sound, position) => {
		if (!judgedPhonemeIds.has(sound.phonemeId)) return;
		const partners = new Set(registry?.[sound.phonemeId]?.map((match) => match.partnerId));
		sounds.push({
			position,
			phonemeId: sound.phonemeId,
			verdict: judgeSound(sound, partners, margins),
		});
	});

	return { pronunciationIndex: pronunciation.pronunciationIndex, sounds };
}

function bestFittingPronunciation(
	pronunciations: readonly PronunciationEvidence[],
): PronunciationEvidence | undefined {
	let best: PronunciationEvidence | undefined;
	let bestFit = -1;
	for (const pronunciation of pronunciations) {
		const fit = meanTargetScore(pronunciation);
		if (fit > bestFit) {
			best = pronunciation;
			bestFit = fit;
		}
	}
	return best;
}

function meanTargetScore({ sounds }: PronunciationEvidence): number {
	if (sounds.length === 0) return 0;
	let total = 0;
	for (const sound of sounds) {
		if (sound.type === "scored") total += sound.targetScore;
	}
	return total / sounds.length;
}

function judgeSound(
	sound: SoundEvidence | MissingSoundEvidence,
	partners: ReadonlySet<PhonemeSymbolId>,
	margins: JudgeMargins,
): SoundVerdict {
	if (sound.type === "missing") return { type: "unclear" };

	const bestRivals = topRivals(sound.rivals);

	if (bestRivals.length === 0) {
		return reaches(sound.targetScore, margins.matchFloor) ? { type: "match" } : { type: "unclear" };
	}

	const [winner] = bestRivals;
	if (reaches(sound.targetScore - winner.score, margins.match)) return { type: "match" };

	if (
		bestRivals.length === 1 &&
		partners.has(winner.phonemeId) &&
		reaches(winner.score - sound.targetScore, margins.swap)
	) {
		return { type: "swapped", heard: winner.phonemeId };
	}

	return { type: "unclear" };
}

// Scores are floats, so a difference that lands exactly on a margin can round
// just below it.
const SCORE_TOLERANCE = 1e-9;

function reaches(value: number, threshold: number): boolean {
	return value >= threshold - SCORE_TOLERANCE;
}

function topRivals(rivals: readonly RivalScore[]): RivalScore[] {
	let bestScore = Number.NEGATIVE_INFINITY;
	for (const rival of rivals) bestScore = Math.max(bestScore, rival.score);
	return rivals.filter((rival) => Math.abs(rival.score - bestScore) <= SCORE_TOLERANCE);
}
