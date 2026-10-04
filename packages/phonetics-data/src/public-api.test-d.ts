// Checked by the package's existing `tsc --noEmit` command, not executed by Vitest.
import { expectTypeOf } from "vitest";
import {
	formatPhonemeLabel,
	getCmuArpaRegistryForLanguage,
	getContrastRegistryForLanguage,
	getLanguagePhonemeIds,
	getSpellingPatternRegistryForLanguage,
	type LanguageDiphthongSymbolId,
	type LanguagePhonemeId,
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
