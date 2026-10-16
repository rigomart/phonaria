import {
	getPhonemeFrequencyRegistryForLanguage,
	hasLanguageFeature,
	type LanguagePhonemeId,
	type PhonemeFrequency,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";

export function hasPhonemeFrequency(targetAccent: TargetAccent): boolean {
	return hasLanguageFeature(targetAccent, "phonemeFrequency");
}

function getFrequencyRegistry(targetAccent: TargetAccent) {
	return getPhonemeFrequencyRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, PhonemeFrequency>
	> | null;
}

export type RankedPhoneme<TLanguage extends TargetAccent = TargetAccent> = PhonemeFrequency & {
	phonemeId: LanguagePhonemeId<TLanguage>;
};

/** Every sound of the accent, most common first, or [] when the accent has no data. */
export function rankPhonemes<TLanguage extends TargetAccent>(
	targetAccent: TLanguage,
): RankedPhoneme<TLanguage>[] {
	const registry = getFrequencyRegistry(targetAccent);
	if (!registry) return [];
	return (Object.entries(registry) as [LanguagePhonemeId<TLanguage>, PhonemeFrequency][])
		.map(([phonemeId, frequency]) => ({
			phonemeId,
			...frequency,
		}))
		.sort((a, b) => a.rank - b.rank);
}

export type PhonemeFrequencySummary = {
	/** 1 is the most common sound. */
	rank: number;
	/** How many sounds are ranked. */
	count: number;
	/** Share of everyday speech, in percent. */
	percentage: number;
	/** `percentage` against the most common sound's, from 0 to 1: how full its bar is. */
	relativeShare: number;
};

/** How common one sound is, for the details header, or null when the accent has no frequency data. */
export function summarizePhonemeFrequency(
	targetAccent: TargetAccent,
	phonemeId: PhonemeSymbolId,
): PhonemeFrequencySummary | null {
	const registry = getFrequencyRegistry(targetAccent);
	const frequency = registry?.[phonemeId as LanguagePhonemeId<TargetAccent>];
	if (!registry || !frequency) return null;
	const frequencies = Object.values(registry) as PhonemeFrequency[];
	const largest = Math.max(...frequencies.map(({ percentage }) => percentage));
	return {
		rank: frequency.rank,
		count: frequencies.length,
		percentage: frequency.percentage,
		relativeShare: frequency.percentage / largest,
	};
}

export function formatPercentage(percentage: number): string {
	return `${percentage >= 0.1 ? percentage.toFixed(1) : percentage.toFixed(2)}%`;
}

export function formatOrdinal(value: number): string {
	const lastTwo = value % 100;
	if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`;
	switch (value % 10) {
		case 1:
			return `${value}st`;
		case 2:
			return `${value}nd`;
		case 3:
			return `${value}rd`;
		default:
			return `${value}th`;
	}
}
