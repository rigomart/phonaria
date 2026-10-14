import {
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeType,
	getSpellingPatternRegistryForLanguage,
	type LanguagePhonemeId,
	type PhonemeType,
	type SpellingPattern,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";

/** What a host decides about the details view. Practice hosts switch the answer-revealing parts off. */
export interface PhonemeDetailsOptions {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	/**
	 * Minimal pairs against similar sounds. Off where the details are Practice
	 * assistance, since a pair could spell out the word being answered.
	 */
	showComparisons?: boolean;
	/**
	 * Spelling patterns and the "as in" example word. Off for Practice
	 * assistance too: an example word could be the answer.
	 */
	showSpellings?: boolean;
	/** Off on the frequency page itself, and in Practice so following it doesn't end the session. */
	showFrequencyLink?: boolean;
}

const TYPE_LABELS: Record<PhonemeType, string> = {
	consonant: "Consonant",
	monophthong: "Vowel",
	diphthong: "Diphthong",
};

export type SoundSummary = ReturnType<typeof describeSound>;

/** Everything the sound header shows, in one place so both levels agree. */
export function describeSound({
	targetAccent,
	phonemeId,
	showSpellings = true,
	showFrequencyLink = true,
}: PhonemeDetailsOptions) {
	const type = getPhonemeType(phonemeId);
	const ipa = getIpaForPhonemeId(phonemeId);
	return {
		ipa,
		// Diphthong labels run to a dozen words; where the glide starts and ends says the same plainly.
		name:
			type === "diphthong"
				? `Glides from /${ipa.charAt(0)}/ to /${ipa.slice(-1)}/`
				: formatPhonemeLabel(targetAccent, phonemeId),
		typeLabel: TYPE_LABELS[type],
		/** Diphthongs have no recordings yet. */
		audioPath: type === "diphthong" ? null : `/audio/phonemes/${phonemeId}.ogg`,
		/** The first spelling example, e.g. "[t]op"; spelling data, so it follows `showSpellings`. */
		example: showSpellings
			? getSpellingPattern(targetAccent, phonemeId)?.examples[0]?.spelled
			: undefined,
		/** Band and rank among all sounds, or null when the accent has no frequency data. */
		frequency: summarizePhonemeFrequency(targetAccent, phonemeId),
		showFrequencyLink,
	};
}

export function getSpellingPattern(
	targetAccent: TargetAccent,
	phonemeId: LanguagePhonemeId<TargetAccent>,
): SpellingPattern | undefined {
	const registry = getSpellingPatternRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, SpellingPattern>
	> | null;
	return registry?.[phonemeId];
}
