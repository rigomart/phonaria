import { describe, expect, it } from "vitest";
import {
	getAllophoneRegistryForLanguage,
	getCmuArpaRegistryForLanguage,
	getContrastRegistryForLanguage,
	getLanguageArticulationData,
	getLanguageFeatureCapabilities,
	getLanguagePhonemeCount,
	getLanguagePhonemeInventory,
	getSpellingPatternRegistryForLanguage,
	hasLanguageFeature,
	isPhonemeInLanguage,
	TARGET_ACCENTS,
} from "./index";

describe.each(TARGET_ACCENTS)("%s shared data", (accent) => {
	it("prevents count mutation from changing later callers", () => {
		const count = getLanguagePhonemeCount(accent);
		const total = count.total;
		let changed: boolean;
		try {
			changed = Reflect.set(count, "total", -1);
			expect(getLanguagePhonemeCount(accent).total).toBe(total);
		} finally {
			Reflect.set(count, "total", total);
		}
		expect(changed).toBe(false);
	});

	it("prevents inventory edits from disagreeing with membership checks", () => {
		const phonemes = getLanguagePhonemeInventory(accent).phonemes;
		const first = phonemes[0];
		try {
			expect(Reflect.set(phonemes, "0", "invalid")).toBe(false);
			expect(getLanguagePhonemeInventory(accent).phonemes[0]).toBe(first);
			expect(isPhonemeInLanguage(accent, first)).toBe(true);
		} finally {
			Reflect.set(phonemes, "0", first);
		}
	});

	it("prevents capability edits from changing feature checks", () => {
		const capabilities = getLanguageFeatureCapabilities(accent);
		try {
			expect(Reflect.set(capabilities, "articulations", false)).toBe(false);
			expect(hasLanguageFeature(accent, "articulations")).toBe(true);
		} finally {
			Reflect.set(capabilities, "articulations", true);
		}
	});
});

// Removing protection from any nested record, example, pair, or array must
// fail this contract, even when the containing object remains protected.
function expectProtected(object: object): void {
	for (const key of Object.keys(object)) {
		const original: unknown = Reflect.get(object, key);
		let changed: boolean;
		try {
			changed = Reflect.set(object, key, "mutated");
		} finally {
			Reflect.set(object, key, original);
		}
		expect(changed, `mutation of ${key}`).toBe(false);
		if (original !== null && typeof original === "object") {
			expectProtected(original);
		}
	}
	// Also protect empty registries/arrays and insertion of new keys.
	const added = Reflect.set(object, "unexpected", true);
	if (added) Reflect.deleteProperty(object, "unexpected");
	expect(added, "insertion of a new property").toBe(false);
}

it.each([
	["English inventory", () => getLanguagePhonemeInventory("en-us")],
	["Spanish inventory", () => getLanguagePhonemeInventory("es-419")],
	["English articulations", () => getLanguageArticulationData("en-us")],
	["Spanish articulations", () => getLanguageArticulationData("es-419")],
	["CMU map", () => getCmuArpaRegistryForLanguage("en-us")],
	["allophones", () => getAllophoneRegistryForLanguage("en-us")],
	["contrasts", () => getContrastRegistryForLanguage("en-us")],
	["spelling patterns", () => getSpellingPatternRegistryForLanguage("en-us")],
] as const)("protects all nested %s data shared with later callers", (_name, getData) => {
	const before = structuredClone(getData());
	expectProtected(getData());
	expect(getData()).toEqual(before);
});

it("prevents array methods from removing shared inventory sounds", () => {
	const ids = getLanguagePhonemeInventory("en-us").phonemes;
	const before = [...ids];
	try {
		expect(() => Array.prototype.pop.call(ids)).toThrow(TypeError);
		expect(getLanguagePhonemeInventory("en-us").phonemes).toEqual(before);
	} finally {
		if (ids.length !== before.length) Array.prototype.push.call(ids, before.at(-1));
	}
});
