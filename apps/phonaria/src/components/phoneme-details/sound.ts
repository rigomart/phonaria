import {
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getMergerNoteRegistryForLanguage,
	getPhonemeType,
	getSpellingPatternRegistryForLanguage,
	type LanguagePhonemeId,
	type MergerNote,
	type PhonemeType,
	type SpellingPattern,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { summarizePhonemeFrequency } from "@/lib/phoneme-frequency";
import { findSoundHeading, findSoundPagePath } from "@/lib/sound-pages";

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
	/** Off on the IPA chart pages, which already show the chart, and in Practice for the same reason as the frequency link. */
	showChartLink?: boolean;
	/** The link to the sound's own page. Off on that page, and in Practice for the same reason as the frequency link. */
	showPageLink?: boolean;
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
	showPageLink = true,
}: PhonemeDetailsOptions) {
	const type = getPhonemeType(phonemeId);
	const ipa = getIpaForPhonemeId(phonemeId);
	// Diphthong labels run to a dozen words; where the glide starts and ends says the same plainly.
	const technical =
		type === "diphthong"
			? `Glides from /${ipa.charAt(0)}/ to /${ipa.slice(-1)}/`
			: formatPhonemeLabel(targetAccent, phonemeId);
	const heading = findSoundHeading(targetAccent, phonemeId);
	return {
		targetAccent,
		ipa,
		/** The heading: the everyday name with the symbol ("Voiceless TH /θ/") where the sound has one, else the technical label. */
		name: heading ?? technical,
		/** The technical label, shown under an everyday name; undefined where `name` is already it. */
		label: heading ? technical : undefined,
		typeLabel: TYPE_LABELS[type],
		audioPath: phonemeAudioPath(phonemeId),
		/** The first spelling example, e.g. top as "[t]op"; spelling data, so it follows `showSpellings`. */
		example: showSpellings ? getSpellingPattern(targetAccent, phonemeId)?.examples[0] : undefined,
		/** Rank and share of speech among all sounds, or null when the accent has no frequency data. */
		frequency: summarizePhonemeFrequency(targetAccent, phonemeId),
		showFrequencyLink,
		/** The sound's own page, where the host allows the link and the accent has pages. */
		pagePath: showPageLink ? findSoundPagePath(targetAccent, phonemeId) : undefined,
	};
}

/** The sound's own recording, or null: diphthongs have no recordings yet. */
export function phonemeAudioPath(phonemeId: LanguagePhonemeId<TargetAccent>): string | null {
	return getPhonemeType(phonemeId) === "diphthong" ? null : `/audio/phonemes/${phonemeId}.ogg`;
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

export function getMergerNotes(
	targetAccent: TargetAccent,
	phonemeId: LanguagePhonemeId<TargetAccent>,
): readonly MergerNote[] {
	const registry = getMergerNoteRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, readonly MergerNote[]>
	> | null;
	return registry?.[phonemeId] ?? [];
}
