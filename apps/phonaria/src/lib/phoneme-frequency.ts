import {
	getPhonemeFrequencyRegistryForLanguage,
	hasLanguageFeature,
	type LanguagePhonemeId,
	type PhonemeFrequency,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";

/**
 * Most common first. `minPercentage` is the lowest share of speech in the band;
 * `barClass` is the band's bar color, a full string so Tailwind can find it.
 */
export const FREQUENCY_BANDS = [
	{ label: "Very common", minPercentage: 4, barClass: "bg-frequency-4" },
	{ label: "Common", minPercentage: 2, barClass: "bg-frequency-3" },
	{ label: "Less common", minPercentage: 0.5, barClass: "bg-frequency-2" },
	{ label: "Rare", minPercentage: 0, barClass: "bg-frequency-1" },
] as const;

export type FrequencyBand = (typeof FREQUENCY_BANDS)[number];

export function hasPhonemeFrequency(targetAccent: TargetAccent): boolean {
	return hasLanguageFeature(targetAccent, "phonemeFrequency");
}

function getFrequencyRegistry(targetAccent: TargetAccent) {
	return getPhonemeFrequencyRegistryForLanguage(targetAccent) as Partial<
		Record<LanguagePhonemeId<TargetAccent>, PhonemeFrequency>
	> | null;
}

export function getFrequencyBand(percentage: number): FrequencyBand {
	const band = FREQUENCY_BANDS.find(({ minPercentage }) => percentage >= minPercentage);
	if (!band) throw new Error(`No frequency band for ${percentage}%`);
	return band;
}

export type RankedPhoneme<TLanguage extends TargetAccent = TargetAccent> = PhonemeFrequency & {
	phonemeId: LanguagePhonemeId<TLanguage>;
	band: FrequencyBand;
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
			band: getFrequencyBand(frequency.percentage),
		}))
		.sort((a, b) => a.rank - b.rank);
}

export type PhonemeFrequencySummary = {
	band: FrequencyBand;
	/** "11th of 40" */
	ranking: string;
};

/** The card's Frequency section, or null when the accent has no frequency data. */
export function summarizePhonemeFrequency(
	targetAccent: TargetAccent,
	phonemeId: PhonemeSymbolId,
): PhonemeFrequencySummary | null {
	const registry = getFrequencyRegistry(targetAccent);
	const frequency = registry?.[phonemeId as LanguagePhonemeId<TargetAccent>];
	if (!registry || !frequency) return null;
	const soundCount = Object.keys(registry).length;
	return {
		band: getFrequencyBand(frequency.percentage),
		ranking: `${formatOrdinal(frequency.rank)} of ${soundCount}`,
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
