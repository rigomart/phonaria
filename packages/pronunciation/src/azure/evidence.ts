import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { alignPhonemes } from "../alignment";
import type {
	MissingSoundEvidence,
	PronunciationEvidence,
	RecordingEvidence,
	RivalScore,
	ScoringRequest,
	SoundEvidence,
	TargetWord,
	WordEvidence,
} from "../contract";
import type { AzureAssessmentResponse, AzurePhoneme, AzureWord } from "./response";
import { phonemeIdsForAzureSymbol } from "./symbols";

const TICKS_PER_SECOND = 10_000_000;
const MIN_AGREEING_SHARE = 0.5;

/** Turns a Pronunciation Assessment response into evidence for the request's words. */
export function azureEvidenceFromResponse(
	response: AzureAssessmentResponse,
	request: ScoringRequest,
): RecordingEvidence {
	const recognized =
		response.RecognitionStatus === "Success" ? (response.NBest?.[0]?.Words ?? []) : [];
	const heardWords = matchWords(request.words, recognized);
	return {
		words: request.words.map((word, index) => {
			const heard = heardWords[index];
			return heard ? wordEvidence(word, heard) : { pronunciations: [] };
		}),
	};
}

function normalizeWord(text: string): string {
	return text
		.normalize("NFC")
		.toLowerCase()
		.replace(/[’‘ʼ]/g, "'")
		.replace(/[^\p{L}\p{N}']/gu, "")
		.replace(/^'+|'+$/g, "");
}

function matchWords(
	targets: readonly TargetWord[],
	recognized: readonly AzureWord[],
): (AzureWord | null)[] {
	let next = 0;
	return targets.map((target) => {
		const text = normalizeWord(target.text);
		const found = recognized.findIndex(
			(word, index) =>
				index >= next && word.ErrorType !== "Insertion" && normalizeWord(word.Word) === text,
		);
		if (found === -1) return null;
		next = found + 1;
		return recognized[found].ErrorType === "Omission" ? null : recognized[found];
	});
}

type HeardSound = {
	readonly phonemeId: PhonemeSymbolId | null;
	readonly phoneme: AzurePhoneme;
	readonly isPartOfUnit: boolean;
};

function wordEvidence(word: TargetWord, heard: AzureWord): WordEvidence {
	const sounds = (heard.Phonemes ?? []).flatMap((phoneme): HeardSound[] => {
		const ids = phonemeIdsForAzureSymbol(phoneme.Phoneme);
		if (!ids) return [{ phonemeId: null, phoneme, isPartOfUnit: false }];
		return ids.map((phonemeId) => ({ phonemeId, phoneme, isPartOfUnit: ids.length > 1 }));
	});
	const heardIds = sounds.map((sound) => sound.phonemeId);

	const pronunciations: PronunciationEvidence[] = [];
	word.acceptedPronunciations.forEach((expected, pronunciationIndex) => {
		const alignment = alignPhonemes(expected, heardIds);
		const same = expected.filter((id, index) => {
			const at = alignment[index];
			return at !== null && heardIds[at] === id;
		}).length;
		if (expected.length === 0 || same < expected.length * MIN_AGREEING_SHARE) return;
		pronunciations.push({
			pronunciationIndex,
			sounds: expected.map((id, index) => {
				const at = alignment[index];
				return at === null ? missing(id) : soundEvidence(id, sounds[at]);
			}),
		});
	});
	return { pronunciations };
}

function missing(phonemeId: PhonemeSymbolId): MissingSoundEvidence {
	return { type: "missing", phonemeId };
}

function soundEvidence(
	target: PhonemeSymbolId,
	heard: HeardSound,
): SoundEvidence | MissingSoundEvidence {
	const { phoneme } = heard;
	const scored = (targetScore: number, rivals: RivalScore[]): SoundEvidence => ({
		type: "scored",
		phonemeId: target,
		startSeconds: phoneme.Offset / TICKS_PER_SECOND,
		endSeconds: (phoneme.Offset + phoneme.Duration) / TICKS_PER_SECOND,
		targetScore: normalize(targetScore),
		rivals,
	});
	// AccuracyScore rates Azure's expected phoneme, so it only stands for the target when they agree.
	const targetOnly = () =>
		heard.phonemeId === target ? scored(phoneme.AccuracyScore, []) : missing(target);

	// Azure's n-best for a two-sound unit rates the whole unit, which can't be split between its sounds.
	if (heard.isPartOfUnit) return targetOnly();

	const nBest = phoneme.NBestPhonemes ?? [];
	if (nBest.length === 0) return targetOnly();

	const scores = new Map<PhonemeSymbolId, number>();
	let bestUnmappedScore = Number.NEGATIVE_INFINITY;
	let lowest = Number.POSITIVE_INFINITY;
	for (const { Phoneme, Score } of nBest) {
		lowest = Math.min(lowest, Score);
		const ids = phonemeIdsForAzureSymbol(Phoneme);
		if (ids?.length === 1) {
			scores.set(ids[0], Math.max(scores.get(ids[0]) ?? Number.NEGATIVE_INFINITY, Score));
		} else {
			bestUnmappedScore = Math.max(bestUnmappedScore, Score);
		}
	}

	// Azure lists only the best few phonemes, so an unlisted target scores at most the lowest listed.
	const targetScore = scores.get(target) ?? lowest;
	const rivals: RivalScore[] = [];
	let bestRival = Number.NEGATIVE_INFINITY;
	for (const [phonemeId, score] of scores) {
		if (phonemeId === target) continue;
		rivals.push({ phonemeId, score: normalize(score) });
		bestRival = Math.max(bestRival, score);
	}
	const unmappedWouldWin =
		bestUnmappedScore > Number.NEGATIVE_INFINITY && bestUnmappedScore >= bestRival;
	if (unmappedWouldWin) return targetOnly();
	return scored(targetScore, rivals);
}

function normalize(score: number): number {
	return Math.min(1, Math.max(0, score / 100));
}
