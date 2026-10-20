import {
	EnglishPhonemeContrasts,
	findSubstitution,
	getSinglePronunciation,
	type PhonemeContrast,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import type { TargetWord } from "../contract";

/**
 * One recording judged against one target word, on the sound where the pair differs.
 * `correct`: the recording is the target word, so the sound should match.
 * `swap`: the recording is the pair partner, so the judge should name the partner's sound.
 */
export type HarnessCase = {
	readonly contrastId: string;
	readonly pair: readonly [string, string];
	readonly kind: "correct" | "swap";
	readonly targetWord: string;
	readonly recordingWord: string;
	/** Position of the judged sound in the target word's pronunciation. */
	readonly position: number;
	readonly targetPhonemeId: PhonemeSymbolId;
	readonly partnerPhonemeId: PhonemeSymbolId;
	/** The sound a recording of `recordingWord` holds at `position`. */
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
