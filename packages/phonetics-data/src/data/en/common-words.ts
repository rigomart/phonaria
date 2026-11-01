import commonWordsJson from "../../../data/en/common-words.json";
import type { EnglishPhonemeSymbolId } from "../../languages/inventories";
import { deepFreeze } from "../../shared/readonly";

/** Up to six words each, most frequent first. */
export interface CommonWordsForSound {
	/** Words that start with the sound. */
	start: readonly string[];
	/** Words with the sound neither first nor last. */
	inside: readonly string[];
	/** Words that end with the sound. */
	end: readonly string[];
}

/**
 * Each en-us sound's most frequent curated top-1k words, by where the sound
 * falls in the word's first pronunciation. Generated into
 * data/en/common-words.json by `bun run --cwd packages/helper-scripts generate-common-words`.
 */
export const EnglishCommonWords = deepFreeze(commonWordsJson.phonemes) as Readonly<
	Record<EnglishPhonemeSymbolId, CommonWordsForSound>
>;
