// Checked by the package's existing `tsc --noEmit` command, not executed by Vitest.
import { expectTypeOf } from "vitest";
import {
	formatPhonemeLabel,
	getAllophoneRegistryForLanguage,
	getCmuArpaRegistryForLanguage,
	getContrastRegistryForLanguage,
	getLanguageArticulationData,
	getLanguageFeatureCapabilities,
	getLanguagePhonemeCount,
	getLanguagePhonemeIds,
	getSpellingPatternRegistryForLanguage,
	type LanguageDiphthongSymbolId,
	type LanguagePhonemeId,
	type LanguageSpellingPatternRegistry,
} from "./index";

const englishIds = getLanguagePhonemeIds("en-us");
const spanishIds = getLanguagePhonemeIds("es-419");
expectTypeOf<(typeof englishIds)[number]>().toEqualTypeOf<LanguagePhonemeId<"en-us">>();
expectTypeOf<(typeof spanishIds)[number]>().toEqualTypeOf<LanguagePhonemeId<"es-419">>();
expectTypeOf(getLanguagePhonemeIds("es-419", "diphthongs")).toEqualTypeOf<readonly []>();
expectTypeOf<LanguageDiphthongSymbolId<"es-419">>().toEqualTypeOf<never>();
expectTypeOf<LanguagePhonemeId<"en-us">>().extract<"EE" | "RR">().toEqualTypeOf<never>();
expectTypeOf<LanguagePhonemeId<"es-419">>().extract<"TH" | "AX">().toEqualTypeOf<never>();
expectTypeOf(getCmuArpaRegistryForLanguage("es-419")).toEqualTypeOf<null>();
expectTypeOf(getContrastRegistryForLanguage("es-419")).toEqualTypeOf<null>();
expectTypeOf(getSpellingPatternRegistryForLanguage("es-419")).toEqualTypeOf<null>();
expectTypeOf(getContrastRegistryForLanguage("en-us")).not.toBeNullable();

// These must stay compiler errors: a broadened public API would silently let
// consumers ask for sounds or features outside the selected accent.
// @ts-expect-error Spanish does not contain the English TH phoneme.
formatPhonemeLabel("es-419", "TH");
// @ts-expect-error English does not contain the Spanish EE phoneme.
formatPhonemeLabel("en-us", "EE");
// @ts-expect-error Unsupported target accent.
getLanguagePhonemeIds("fr-fr");
// @ts-expect-error Unknown inventory subset.
getLanguagePhonemeIds("en-us", "syllables");

// Shared data stays readonly through nested records, arrays, and examples.
// @ts-expect-error Counts cannot be changed by consumers.
getLanguagePhonemeCount("en-us").total = 0;
// @ts-expect-error Feature support is shared readonly data.
getLanguageFeatureCapabilities("en-us").articulations = false;
// @ts-expect-error Articulation registry entries cannot be replaced.
getLanguageArticulationData("en-us").consonants.P =
	getLanguageArticulationData("en-us").consonants.B;
// @ts-expect-error Nested articulation features cannot be changed.
getLanguageArticulationData("en-us").consonants.P.features.place = "dental";
// @ts-expect-error Derived feature indexes cannot be edited.
getLanguageArticulationData("en-us").featureValuesByPhoneme.place.P = "dental";
// @ts-expect-error Contrast arrays cannot be appended to.
getContrastRegistryForLanguage("en-us").P?.push({
	contrastId: "p-b",
	partnerId: "B",
	minimalPairs: [],
});
const contrastMatch = getContrastRegistryForLanguage("en-us").P?.[0];
if (contrastMatch) {
	// @ts-expect-error Nested contrast records cannot be edited.
	contrastMatch.partnerId = "T";
}
const allophoneExample = getAllophoneRegistryForLanguage("en-us").P?.[0]?.examples[0];
if (allophoneExample) {
	// @ts-expect-error Allophone examples cannot be edited.
	allophoneExample.word = "changed";
}
// @ts-expect-error Spelling pattern arrays cannot be replaced.
getSpellingPatternRegistryForLanguage("en-us").P.patterns = ["changed"];
// @ts-expect-error Inventory arrays cannot be appended to.
englishIds.push("P");

// Named public types must preserve the same protection as inferred selectors.
const spellingPatterns: LanguageSpellingPatternRegistry<"en-us"> =
	getSpellingPatternRegistryForLanguage("en-us");
const spellingExample = spellingPatterns.P?.examples[0];
if (spellingExample) {
	// @ts-expect-error Nested examples stay readonly through the public registry type.
	spellingExample.word = "changed";
}
