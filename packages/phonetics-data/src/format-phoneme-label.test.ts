import { describe, expect, it } from "vitest";
import type { PhonemeSymbolId } from "./core/ipa-map";
import { formatPhonemeLabel, isPhonemeInLanguage } from "./index";

const GOLDEN_LABELS = {
	P: "Voiceless bilabial plosive",
	B: "Voiced bilabial plosive",
	T: "Voiceless alveolar plosive",
	D: "Voiced alveolar plosive",
	G: "Voiced velar plosive",
	K: "Voiceless velar plosive",
	DH: "Voiced dental fricative",
	TH: "Voiceless dental fricative",
	F: "Voiceless labiodental fricative",
	V: "Voiced labiodental fricative",
	H: "Voiceless glottal fricative",
	S: "Voiceless alveolar fricative",
	SH: "Voiceless postalveolar fricative",
	Z: "Voiced alveolar fricative",
	ZH: "Voiced postalveolar fricative",
	J: "Voiced postalveolar affricate",
	CH: "Voiceless postalveolar affricate",
	M: "Voiced bilabial nasal",
	N: "Voiced alveolar nasal",
	NG: "Voiced velar nasal",
	NY: "Voiced palatal nasal",
	L: "Voiced alveolar lateral approximant",
	R: "Voiced postalveolar approximant",
	RX: "Voiced alveolar tap",
	RR: "Voiced alveolar trill",
	Y: "Voiced palatal approximant",
	W: "Voiced labial-velar approximant",
	X: "Voiceless velar fricative",
	YH: "Voiced palatal fricative",
	I: "Close front unrounded vowel",
	U: "Close back rounded vowel",
	AA: "Open central unrounded vowel",
	IX: "Near-close near-front unrounded vowel",
	UX: "Near-close near-back rounded vowel",
	AX: "Mid central unrounded vowel",
	E: "Open-mid front unrounded vowel",
	EE: "Close-mid front unrounded vowel",
	AH: "Open-mid back unrounded vowel",
	O: "Open-mid back rounded vowel",
	OO: "Close-mid back rounded vowel",
	AE: "Near-open front unrounded vowel",
	A: "Open back unrounded vowel",
	EI: "Close-mid front unrounded to near-close near-front unrounded diphthong",
	OU: "Close-mid back rounded to near-close near-back rounded diphthong",
	AI: "Open front unrounded to near-close near-front unrounded diphthong",
	AU: "Open front unrounded to near-close near-back rounded diphthong",
	OI: "Open-mid back rounded to near-close near-front unrounded diphthong",
	ER: "Open-mid central r-colored vowel",
} as const satisfies Record<PhonemeSymbolId, string>;

describe("formatPhonemeLabel", () => {
	it("derives every current Lab label from structured articulation data", () => {
		for (const [phonemeId, expectedLabel] of Object.entries(GOLDEN_LABELS)) {
			const id = phonemeId as PhonemeSymbolId;
			let actualLabel: string;
			if (isPhonemeInLanguage("en-us", id)) {
				actualLabel = formatPhonemeLabel("en-us", id);
			} else if (isPhonemeInLanguage("es-419", id)) {
				actualLabel = formatPhonemeLabel("es-419", id);
			} else {
				throw new Error(`No articulation registry contains ${id}`);
			}

			expect(actualLabel).toBe(expectedLabel);
		}
	});

	it("uses the target accent when a shared ID has different articulation", () => {
		expect(formatPhonemeLabel("en-us", "T")).toBe("Voiceless alveolar plosive");
		expect(formatPhonemeLabel("es-419", "T")).toBe("Voiceless dental plosive");
	});
});
