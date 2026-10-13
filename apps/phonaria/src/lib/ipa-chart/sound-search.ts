import {
	getPhonemeType,
	isPhonemeInLanguage,
	type LanguagePhonemeId,
	PhonemeIpaMap,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { IPA_CHART_CONSONANTS_PATH, IPA_CHART_VOWELS_PATH } from "@/lib/ipa-chart-metadata";

/**
 * Chart-page search. `sound` is the selected phoneme ID (`?sound=T`), shown in
 * the details panel on wide screens and in a drawer on narrow ones.
 */
export type ChartSoundSearch = {
	sound?: string;
};

/** Which sounds a chart page can select: its own category, or any on Frequency. */
export type ChartSoundScope = "consonants" | "vowels" | "all";

function isPhonemeSymbolId(value: string): value is PhonemeSymbolId {
	return Object.hasOwn(PhonemeIpaMap, value);
}

function fitsScope(phonemeId: PhonemeSymbolId, scope: ChartSoundScope): boolean {
	if (scope === "all") return true;
	const isConsonant = getPhonemeType(phonemeId) === "consonant";
	return scope === "consonants" ? isConsonant : !isConsonant;
}

/** The selected sound, or undefined when the value is not one this chart shows. */
export function parseChartSound<TLanguage extends TargetAccent>(
	value: unknown,
	targetAccent: TLanguage,
	scope: ChartSoundScope,
): LanguagePhonemeId<TLanguage> | undefined {
	if (typeof value !== "string") return undefined;
	const id = value.trim().toUpperCase();
	if (!isPhonemeSymbolId(id)) return undefined;
	if (!isPhonemeInLanguage(targetAccent, id)) return undefined;
	return fitsScope(id, scope) ? id : undefined;
}

/**
 * Route `validateSearch` for a chart page. TanStack Router merges this onto the
 * parsed search, so `sound` is always returned and an invalid value is dropped.
 */
export function createChartSoundSearchValidator(
	targetAccent: TargetAccent,
	scope: ChartSoundScope,
) {
	return (search: Record<string, unknown>): ChartSoundSearch => ({
		sound: parseChartSound(search.sound, targetAccent, scope),
	});
}

/** The chart that shows this sound: consonants or vowels (diphthongs included). */
export function getChartPathForPhoneme(phonemeId: PhonemeSymbolId) {
	return getPhonemeType(phonemeId) === "consonant"
		? IPA_CHART_CONSONANTS_PATH
		: IPA_CHART_VOWELS_PATH;
}

/** What a chart page gets from its route to show and change the selected sound. */
export type ChartSoundProps = {
	selectedSound: string | undefined;
	onSelectSound: (phonemeId: string) => void;
	onCloseSound: () => void;
};
