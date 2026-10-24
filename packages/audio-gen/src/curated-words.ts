import {
	LanguageWordAudioDataRegistry,
	phonemeVariantToCmuArpa,
	preferOForms,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop1k } from "@phonaria/phonetics-data/data/en/curated-1k";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { curatedPronunciations } from "./reviewed-pronunciations";
import { isPlainWord, wordForms } from "./word-forms";

export type CuratedTier = "top-1k" | "top-10k";

export type PronunciationChoice = {
	source: "only" | "reviewed" | "rule";
	reason: string;
};

export type ExclusionReason = "not a plain word" | "abbreviation or letter";

export function getExclusionReason(word: string): ExclusionReason | undefined {
	if (!isPlainWord(word)) return "not a plain word";
	if (!/[aeiouy]/.test(word) || (word.length === 1 && word !== "a" && word !== "i"))
		return "abbreviation or letter";
	return undefined;
}

const vowelCount = (variant: string) => variant.match(/[012]/g)?.length ?? 0;

/**
 * Picks the form a speaker would say alone: a reviewed choice, then a heteronym's main
 * meaning, then the first dictionary form, except that a one-syllable word takes its first
 * stressed one-syllable form (/ðʌ/, not /ðə/). An /ɔ/ form takes the place of its /ɑ/ form
 * (`preferOForms`), so caught is /kɔt/. Throws when there are no variants.
 */
export function pickPronunciation(
	word: string,
	variants: readonly string[],
): { variant: string; choice: PronunciationChoice } {
	const reviewed = curatedPronunciations[word];
	if (reviewed)
		return { variant: reviewed.variant, choice: { source: "reviewed", reason: reviewed.reason } };
	const heteronym = wordForms[word]?.primary;
	if (heteronym)
		return {
			variant: heteronym.variant,
			choice: { source: "reviewed", reason: `heteronym: ${heteronym.label}` },
		};
	if (!variants.length) throw new Error(`No pronunciation for "${word}"`);
	if (new Set(variants.map(phonemeVariantToCmuArpa)).size === 1)
		return { variant: variants[0], choice: { source: "only", reason: "only dictionary form" } };
	const ordered = preferOForms(variants);
	const sameLength = ordered.filter((variant) => vowelCount(variant) === vowelCount(ordered[0]));
	const stressed =
		vowelCount(ordered[0]) === 1 ? sameLength.find((variant) => /1/.test(variant)) : undefined;
	const variant = stressed ?? ordered[0];
	const rule = stressed ? "first stressed one-syllable form" : "first dictionary form";
	const preferredO = ordered.indexOf(variant) !== variants.indexOf(variant);
	const others = variants.filter((other) => other !== variant).join(" | ");
	return {
		variant,
		choice: {
			source: "rule",
			reason: `${preferredO ? `/ɔ/ form of the ${rule}` : rule}; not ${others}`,
		},
	};
}

/** Curated words of a tier that have no recording yet and can be recorded, in frequency order. */
export function collectCuratedWords(
	tier: CuratedTier,
	recorded: ReadonlySet<string> = new Set(LanguageWordAudioDataRegistry["en-us"].words),
) {
	const dictionary = tier === "top-1k" ? EnglishCuratedTop1k : EnglishCuratedTop10k;
	const words: { word: string; variants: readonly string[] }[] = [];
	const excluded: { word: string; reason: ExclusionReason }[] = [];
	for (const [word, variants] of Object.entries(dictionary.words)) {
		if (recorded.has(word)) continue;
		const reason = getExclusionReason(word);
		if (reason) excluded.push({ word, reason });
		else words.push({ word, variants });
	}
	return { words, excluded };
}
