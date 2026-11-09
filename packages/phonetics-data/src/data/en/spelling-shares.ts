import spellingSharesJson from "../../../data/en/spelling-shares.json";
import type { TargetAccent } from "../../core/types";
import type { EnglishPhonemeSymbolId } from "../../languages/inventories";
import { deepFreeze } from "../../shared/readonly";

/** Up to three example words per place, most frequent first, the spelling's letters in brackets ("enou[gh]"). */
export interface SpellingShareWords {
	/** Words that start with the sound. */
	start: readonly string[];
	/** Words with the sound neither first nor last. */
	inside: readonly string[];
	/** Words that end with the sound. */
	end: readonly string[];
}

/** One way a sound is spelled, and how much of the sound in everyday speech it spells. */
export interface SpellingShare {
	/** The letters, or a vowel and the silent e it goes with: "gh", "a-e". */
	spelling: string;
	/** Share of the sound's uses in everyday speech spelled this way, 0–100. */
	percentage: number;
	/** The most frequent example word wherever the sound falls in it, or null when none has a recording. */
	topWord: string | null;
	words: SpellingShareWords;
}

export interface SoundSpellingShares {
	/** The spellings with 2% or more of the sound, most common first. */
	spellings: readonly SpellingShare[];
	/** The rest, most common first: rare spellings, and some of the matcher's mistakes. */
	other: readonly SpellingShare[];
}

/**
 * How often each spelling spells each en-us sound in the curated top-10k words, each word
 * weighted by how often it is used. Generated into data/en/spelling-shares.json by
 * `python3 packages/helper-scripts/generate-spelling-shares.py`.
 */
export const EnglishSpellingShares = deepFreeze(spellingSharesJson.phonemes) as Readonly<
	Record<EnglishPhonemeSymbolId, SoundSpellingShares>
>;

/** The share below which a spelling is listed under `other`, as a percentage. */
export const OTHER_SPELLINGS_BELOW_PERCENTAGE = spellingSharesJson.meta.otherBelowPercentage;

/** An accent's spelling shares, or null when the accent has none (`spellingShares` capability). */
export function getSpellingSharesForLanguage(
	targetAccent: TargetAccent,
): Readonly<Record<EnglishPhonemeSymbolId, SoundSpellingShares>> | null {
	return targetAccent === "en-us" ? EnglishSpellingShares : null;
}
