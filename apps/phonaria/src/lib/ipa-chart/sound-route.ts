import {
	getLanguagePhonemeIds,
	getPhonemeType,
	isPhonemeInLanguage,
	type LanguagePhonemeId,
	PhonemeIpaMap,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import {
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_INDEX_PATH,
	IPA_CHART_VOWELS_PATH,
} from "@/lib/ipa-chart-metadata";

/**
 * Each sound has its own page under the IPA chart, named by its lowercase
 * phoneme ID: `/ipa-chart/t`, `/ipa-chart/sh`, `/ipa-chart/ae`.
 */
export function getSoundSlug(phonemeId: PhonemeSymbolId): string {
	return phonemeId.toLowerCase();
}

export function getSoundPath(phonemeId: PhonemeSymbolId): string {
	return `${IPA_CHART_INDEX_PATH}/${getSoundSlug(phonemeId)}`;
}

function isPhonemeSymbolId(value: string): value is PhonemeSymbolId {
	return Object.hasOwn(PhonemeIpaMap, value);
}

/** The sound a slug names, in any letter case, or undefined if the accent lacks it. */
export function parseSoundSlug<TLanguage extends TargetAccent>(
	slug: string,
	targetAccent: TLanguage,
): LanguagePhonemeId<TLanguage> | undefined {
	const id = slug.toUpperCase();
	if (!isPhonemeSymbolId(id) || !isPhonemeInLanguage(targetAccent, id)) return undefined;
	return id;
}

export type ChartSection = "consonants" | "vowels";

/** Consonants, or vowels with diphthongs, as the chart tabs group them. */
export function getChartSection(phonemeId: PhonemeSymbolId): ChartSection {
	return getPhonemeType(phonemeId) === "consonant" ? "consonants" : "vowels";
}

export function getChartSectionPath(section: ChartSection) {
	return section === "consonants" ? IPA_CHART_CONSONANTS_PATH : IPA_CHART_VOWELS_PATH;
}

/** The sounds of a chart section, in inventory order. */
export function getChartSectionSounds<TLanguage extends TargetAccent>(
	targetAccent: TLanguage,
	section: ChartSection,
): LanguagePhonemeId<TLanguage>[] {
	if (section === "consonants") return [...getLanguagePhonemeIds(targetAccent, "consonants")];
	return [
		...getLanguagePhonemeIds(targetAccent, "monophthongs"),
		...getLanguagePhonemeIds(targetAccent, "diphthongs"),
	];
}

/**
 * The chart tab a path belongs to: a sound page belongs to its sound's chart.
 * Other paths are returned unchanged.
 */
export function getChartTabPath(pathname: string, targetAccent: TargetAccent): string {
	const prefix = `${IPA_CHART_INDEX_PATH}/`;
	if (!pathname.startsWith(prefix)) return pathname;
	const sound = parseSoundSlug(pathname.slice(prefix.length), targetAccent);
	return sound ? getChartSectionPath(getChartSection(sound)) : pathname;
}
