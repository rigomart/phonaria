import { expect, it } from "vitest";
// Import language entry points independently of the composition registries.
import {
	CmuArpaMap,
	EnglishConsonantArticulations,
	EnglishContrastsByPhonemeId,
	EnglishPhonemeAllophones,
	EnglishPhonemeContrasts,
	EnglishPhonemeSpellingPatterns,
} from "./en";
import { SpanishConsonantArticulations } from "./es";

it.each([
	["English consonant table", () => EnglishConsonantArticulations, "P"],
	["Spanish consonant table", () => SpanishConsonantArticulations, "P"],
	["English articulation features", () => EnglishConsonantArticulations.P.features, "place"],
	["Spanish articulation features", () => SpanishConsonantArticulations.P.features, "place"],
	["CMU map", () => CmuArpaMap, "P"],
	["allophone examples", () => EnglishPhonemeAllophones.P?.[0]?.examples[0], "word"],
	["contrast catalog", () => EnglishPhonemeContrasts, "0"],
	["catalog word pairs", () => EnglishPhonemeContrasts[0]?.minimalPairs[0]?.words, "0"],
	["indexed word pairs", () => EnglishContrastsByPhonemeId.B?.[0]?.minimalPairs[0]?.words, "0"],
	["spelling examples", () => EnglishPhonemeSpellingPatterns.P.examples[0], "word"],
] as const)("protects directly imported %s", (_name, getData, key) => {
	const data = getData();
	if (!data) throw new Error("Missing regression fixture");
	const original: unknown = Reflect.get(data, key);
	let changed: boolean;
	try {
		changed = Reflect.set(data, key, "mutated");
		expect(Reflect.get(data, key)).toEqual(original);
	} finally {
		Reflect.set(data, key, original);
	}
	expect(changed).toBe(false);
});
