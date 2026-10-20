import {
	EnglishPhonemeContrasts,
	findSubstitution,
	getSinglePronunciation,
	type PhonemeContrast,
	type PhonemeSymbolId,
	toBasePhonemeIds,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import type { TargetWord } from "../contract";
import type { PronunciationLookup } from "../word-gate";

/**
 * What a `wrong-word` recording holds instead of the target or its partner:
 * an unrelated word (*kid* for *ship*), the word with sounds added (*ships*), a
 * phrase ("a ship"), a made-up word (*shap*), or silence or noise.
 */
export type WrongWordKind = "unrelated" | "added-sounds" | "phrase" | "nonword" | "silence";

export const WRONG_WORD_KINDS: readonly WrongWordKind[] = [
	"unrelated",
	"added-sounds",
	"phrase",
	"nonword",
	"silence",
];

/**
 * One recording judged against one target word, on the sound where the pair differs.
 * `correct`: the recording is the target word, so the sound should match.
 * `swap`: the recording is the pair partner, so the judge should name the partner's sound.
 * `wrong-word`: the recording is neither, so the word gate should stop it before
 * any sound is judged.
 */
export type HarnessCase = {
	readonly contrastId: string;
	readonly pair: readonly [string, string];
	readonly kind: "correct" | "swap" | "wrong-word";
	/** Set for `wrong-word` cases only. */
	readonly wrongWord?: WrongWordKind;
	readonly targetWord: string;
	/** The word or words said; for silence, what it was. */
	readonly recordingWord: string;
	/** Position of the judged sound in the target word's pronunciation. */
	readonly position: number;
	readonly targetPhonemeId: PhonemeSymbolId;
	readonly partnerPhonemeId: PhonemeSymbolId;
	/** The sound a recording of `recordingWord` holds at `position`; the target's for `wrong-word`. */
	readonly expectedHeard: PhonemeSymbolId;
	readonly judgedPhonemeIds: readonly PhonemeSymbolId[];
};

export type Dictionary = Readonly<Record<string, readonly string[] | undefined>>;

type Catalog = readonly PhonemeContrast<"en-us">[];

/** The word's one pronunciation in the dictionary the contrast catalog is validated against. */
export function pronunciationOf(
	word: string,
	dictionary: Dictionary = EnglishCuratedTop10k.words,
): readonly PhonemeSymbolId[] {
	const variants = dictionary[word];
	if (!variants) throw new Error(`"${word}" isn't in the curated top-10k dictionary`);
	const pronunciation = getSinglePronunciation(variants);
	if (!pronunciation) throw new Error(`"${word}" has competing pronunciations`);
	return pronunciation;
}

/** Every pronunciation the curated top-10k dictionary lists, for the word gate. */
export const curatedPronunciations: PronunciationLookup = (word) =>
	EnglishCuratedTop10k.words[word]?.map((variant) => toBasePhonemeIds(variant));

export function targetWordFor(word: string, dictionary?: Dictionary): TargetWord {
	return { text: word, acceptedPronunciations: [pronunciationOf(word, dictionary)] };
}

/** Every minimal pair, both ways round: each word against itself and against its partner. */
export function buildCatalogCases(
	contrasts: Catalog = EnglishPhonemeContrasts,
	dictionary?: Dictionary,
): HarnessCase[] {
	const cases: HarnessCase[] = [];
	for (const contrast of contrasts) {
		for (const { words } of contrast.minimalPairs) {
			const [first, second] = words;
			const substitution = findSubstitution(
				pronunciationOf(first, dictionary),
				pronunciationOf(second, dictionary),
			);
			if (!substitution) {
				throw new Error(`${contrast.id}: "${first}" / "${second}" differ by more than one sound`);
			}
			const sides = [
				{ word: first, sound: substitution.from },
				{ word: second, sound: substitution.to },
			] as const;
			for (const [target, other] of [sides, [sides[1], sides[0]]] as const) {
				const shared = {
					contrastId: contrast.id,
					pair: words,
					targetWord: target.word,
					position: substitution.index,
					targetPhonemeId: target.sound,
					partnerPhonemeId: other.sound,
					judgedPhonemeIds: contrast.phonemeIds,
				};
				cases.push(
					{ ...shared, kind: "correct", recordingWord: target.word, expectedHeard: target.sound },
					{ ...shared, kind: "swap", recordingWord: other.word, expectedHeard: other.sound },
				);
			}
		}
	}
	return cases;
}

export type RecordingPair = {
	readonly contrastId: string;
	readonly words: readonly [string, string];
};

/**
 * One pair per contrast for real-voice recordings (#327): the first pair whose
 * words no earlier contrast already uses, so every word is recorded once.
 */
export function recordingWordList(contrasts: Catalog = EnglishPhonemeContrasts): RecordingPair[] {
	const used = new Set<string>();
	return contrasts.map((contrast) => {
		const pair =
			contrast.minimalPairs.find(({ words }) => !words.some((word) => used.has(word))) ??
			contrast.minimalPairs[0];
		for (const word of pair.words) used.add(word);
		return { contrastId: contrast.id, words: pair.words };
	});
}

/** A labelled recording judged against `target`, whose pair partner is `partner`. */
export type ClipLabel = {
	readonly target: string;
	readonly partner: string;
	readonly kind: "correct" | "swap" | WrongWordKind;
	/** What the recording holds. */
	readonly said: string;
};

/** The case for one labelled clip, from the catalog pair of its target and partner. */
export function caseForClip(
	{ target, partner, kind, said }: ClipLabel,
	contrasts: Catalog = EnglishPhonemeContrasts,
	dictionary?: Dictionary,
): HarnessCase {
	const contrast = contrasts.find((candidate) =>
		candidate.minimalPairs.some(({ words }) => words.includes(target) && words.includes(partner)),
	);
	if (!contrast) throw new Error(`"${target}" and "${partner}" aren't a minimal pair`);
	const pairCases = buildCatalogCases([contrast], dictionary).filter(
		(candidate) => candidate.targetWord === target && candidate.pair.includes(partner),
	);
	const correct = pairCases.find((candidate) => candidate.kind === "correct");
	const swap = pairCases.find((candidate) => candidate.kind === "swap");
	if (!correct || !swap) throw new Error(`No case for "${target}" against "${partner}"`);
	if (kind === "correct") return correct;
	if (kind === "swap") return swap;
	return { ...correct, kind: "wrong-word", wrongWord: kind, recordingWord: said };
}
