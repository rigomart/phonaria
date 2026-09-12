/**
 * Card-facing detail derived from a topic's sounds rather than written per
 * topic — a second copy of the symbols and example words would drift from
 * `@phonaria/phonetics-data`. The sound palette sources examples the same way.
 */
import {
	EnglishPhonemeSpellingPatterns,
	type EnglishPhonemeSymbolId,
	getIpaForPhonemeId,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";

export interface TopicSoundSummary {
	/** One IPA symbol per topic sound, in the topic's own order. */
	ipa: readonly string[];
	/** Words the topic's sounds are heard in, deduped and capped. */
	examples: readonly string[];
}

/** Enough to recognize the sound without turning the card into a word list. */
const MAX_EXAMPLES = 3;

/** Topics name language-agnostic IDs; only English carries spelling patterns. */
function examplesFor(phonemeId: PhonemeSymbolId): readonly string[] {
	const spelling = EnglishPhonemeSpellingPatterns[phonemeId as EnglishPhonemeSymbolId];
	return spelling?.examples.map((example) => example.word.toLowerCase()) ?? [];
}

/**
 * Takes examples a sound at a time, so a multi-sound topic shows each of its
 * sounds before any one of them contributes a second word.
 */
export function summarizeTopicSounds(topicSounds: readonly PhonemeSymbolId[]): TopicSoundSummary {
	const perSound = topicSounds.map(examplesFor);
	const examples: string[] = [];

	const deepest = Math.max(0, ...perSound.map((words) => words.length));
	for (let position = 0; position < deepest && examples.length < MAX_EXAMPLES; position++) {
		for (const words of perSound) {
			if (examples.length >= MAX_EXAMPLES) break;
			const word = words[position];
			if (word && !examples.includes(word)) examples.push(word);
		}
	}

	return {
		ipa: topicSounds.map((phonemeId) => getIpaForPhonemeId(phonemeId)),
		examples,
	};
}
