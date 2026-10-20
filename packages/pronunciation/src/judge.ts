import {
	getContrastRegistryForLanguage,
	type PhonemeContrastMatch,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { allowedVariants } from "./allowed-variants";
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
	/** Judge only these sounds. Omitted, every sound in the word is judged. */
	readonly judgedPhonemeIds?: ReadonlySet<PhonemeSymbolId>;
	readonly targetAccent: TargetAccent;
	readonly margins?: JudgeMargins;
	/** The dictionary word a pronunciation spells, if any. Lets a `swapped` verdict carry `heardWord`. */
	readonly findWord?: WordFinder;
};

export type WordFinder = (phonemeIds: readonly PhonemeSymbolId[]) => string | undefined;

/**
 * A `WordFinder` over words and their pronunciations. The first word listed wins
 * a homophone, so list the words to prefer first, such as a minimal pair's partner.
 */
export function createWordFinder(
	words: Iterable<readonly [string, readonly (readonly PhonemeSymbolId[])[]]>,
): WordFinder {
	const byPronunciation = new Map<string, string>();
	for (const [word, pronunciations] of words) {
		for (const pronunciation of pronunciations) {
			const key = pronunciation.join(" ");
			if (!byPronunciation.has(key)) byPronunciation.set(key, word);
		}
	}
	return (phonemeIds) => byPronunciation.get(phonemeIds.join(" "));
}

export type SoundJudgement = {
	/** Position of the sound in the judged pronunciation. */
	readonly position: number;
	readonly phonemeId: PhonemeSymbolId;
	readonly verdict: SoundVerdict;
};

export type WordJudgement = {
	/** The accepted pronunciation the verdicts were judged against. */
	readonly pronunciationIndex: number;
	/** Sounds in the judged set, or every sound when none was given, one per occurrence. */
	readonly sounds: readonly SoundJudgement[];
};

/** Null when the scorer lined up none of the accepted pronunciations. */
export function judgeWord({
	evidence,
	judgedPhonemeIds,
	targetAccent,
	margins = LENIENT_MARGINS,
	findWord,
}: JudgeInput): WordJudgement | null {
	const pronunciation = bestFittingPronunciation(evidence.pronunciations);
	if (!pronunciation) return null;
	const phonemeIds = pronunciation.sounds.map((sound) => sound.phonemeId);

	const sounds: SoundJudgement[] = [];
	pronunciation.sounds.forEach((sound, position) => {
		if (judgedPhonemeIds && !judgedPhonemeIds.has(sound.phonemeId)) return;
		const verdict = judgeSound(
			sound.type === "scored"
				? scoreVariantsAsTarget(sound, allowedVariants(targetAccent, phonemeIds, position))
				: sound,
			contrastPartners(targetAccent, sound.phonemeId),
			margins,
		);
		sounds.push({
			position,
			phonemeId: sound.phonemeId,
			verdict:
				verdict.type === "swapped" && findWord
					? withHeardWord(verdict, phonemeIds, position, findWord)
					: verdict,
		});
	});

	return { pronunciationIndex: pronunciation.pronunciationIndex, sounds };
}

function withHeardWord(
	verdict: Extract<SoundVerdict, { type: "swapped" }>,
	phonemeIds: readonly PhonemeSymbolId[],
	position: number,
	findWord: WordFinder,
): SoundVerdict {
	const heardWord = findWord(
		phonemeIds.map((id, index) => (index === position ? verdict.heard : id)),
	);
	return heardWord === undefined ? verdict : { ...verdict, heardWord };
}

/** The sounds the contrast catalog pairs with `phonemeId`. */
export function contrastPartners(
	targetAccent: TargetAccent,
	phonemeId: PhonemeSymbolId,
): ReadonlySet<PhonemeSymbolId> {
	const registry = getContrastRegistryForLanguage(targetAccent) as Partial<
		Record<PhonemeSymbolId, readonly PhonemeContrastMatch[]>
	> | null;
	return new Set(registry?.[phonemeId]?.map((match) => match.partnerId));
}

/** The pronunciation the judge uses: the highest mean target score, missing sounds counting as zero. */
export function bestFittingPronunciation(
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

/** Allowed variants are never rivals. */
function scoreVariantsAsTarget(
	sound: SoundEvidence,
	variants: ReadonlySet<PhonemeSymbolId>,
): SoundEvidence {
	if (variants.size === 0) return sound;
	let { targetScore } = sound;
	const rivals = sound.rivals.filter((rival) => {
		if (!variants.has(rival.phonemeId)) return true;
		targetScore = Math.max(targetScore, rival.score);
		return false;
	});
	return { ...sound, targetScore, rivals };
}

function judgeSound(
	sound: SoundEvidence | MissingSoundEvidence,
	partners: ReadonlySet<PhonemeSymbolId>,
	margins: JudgeMargins,
): SoundVerdict {
	if (sound.type === "missing") return { type: "unclear", reason: "no-evidence" };

	const bestRivals = topRivals(sound.rivals);

	if (bestRivals.length === 0) {
		return reaches(sound.targetScore, margins.matchFloor)
			? { type: "match" }
			: { type: "unclear", reason: "other-sound" };
	}

	const [winner] = bestRivals;
	if (reaches(sound.targetScore - winner.score, margins.match)) return { type: "match" };

	if (bestRivals.length > 1 || !partners.has(winner.phonemeId)) {
		return { type: "unclear", reason: "other-sound" };
	}
	if (reaches(winner.score - sound.targetScore, margins.swap)) {
		return { type: "swapped", heard: winner.phonemeId };
	}
	return { type: "unclear", reason: "close-call" };
}

// Scores are floats, so a difference that lands exactly on a margin can round
// just below it.
const SCORE_TOLERANCE = 1e-9;

export function reaches(value: number, threshold: number): boolean {
	return value >= threshold - SCORE_TOLERANCE;
}

/** The rivals tied for the best score, within float tolerance. */
export function topRivals(rivals: readonly RivalScore[]): RivalScore[] {
	let bestScore = Number.NEGATIVE_INFINITY;
	for (const rival of rivals) bestScore = Math.max(bestScore, rival.score);
	return rivals.filter((rival) => Math.abs(rival.score - bestScore) <= SCORE_TOLERANCE);
}
