import { ARPABET_TO_IPA } from "../_constants/arpabet-to-ipa";

type StressLevel = 0 | 1 | 2;
type PhonemeType = "vowel" | "consonant";

interface ArpaToken {
	base: string;
	stress?: StressLevel;
	type: PhonemeType;
}

const VOWELS_WITH_STRESS = new Set([
	"AA",
	"AE",
	"AH",
	"AO",
	"AW",
	"AY",
	"EH",
	"ER",
	"EY",
	"IH",
	"IY",
	"OW",
	"OY",
	"UH",
	"UW",
	"AX",
	"AXR",
	"IX",
	"UX",
]);

const SYLLABIC_CONSONANTS = new Set(["EL", "EM", "EN"]);

const CONSONANT_FALLBACK: Record<string, string> = {
	DX: "ɾ",
	NX: "ɾ̃",
	Q: "ʔ",
	WH: "ʍ",
	EL: "l̩",
	EM: "m̩",
	EN: "n̩",
};

function parseArpaToken(raw: string): ArpaToken {
	const match = raw.match(/^([A-Z]+?)([0-2])?$/);
	if (!match) {
		return { base: raw, type: "consonant" };
	}
	const base = match[1];
	const stress = match[2] ? (parseInt(match[2], 10) as StressLevel) : undefined;
	const isVowelLike = VOWELS_WITH_STRESS.has(base) || SYLLABIC_CONSONANTS.has(base);
	const type: PhonemeType = isVowelLike ? "vowel" : "consonant";
	const effectiveStress = VOWELS_WITH_STRESS.has(base) ? stress : undefined;
	return { base, stress: effectiveStress, type };
}

function mapArpaToIpa(raw: string): string {
	return (
		ARPABET_TO_IPA[raw] ||
		ARPABET_TO_IPA[raw.replace(/[0-2]$/, "")] ||
		CONSONANT_FALLBACK[raw] ||
		raw
	);
}

function countNuclei(tokens: ArpaToken[]): number {
	return tokens.reduce((count, t) => count + (t.type === "vowel" ? 1 : 0), 0);
}

/**
 * Convert ARPAbet tokens to an IPA array with correctly positioned stress marks.
 * - Stress marks (ˈ, ˌ) are separate tokens inserted before the onset of the stressed syllable.
 * - Monosyllabic words (≤1 nucleus) suppress stress entirely.
 */
export function convertArpabetToIPA(arpaPhonemes: string[]): string[] {
	if (arpaPhonemes.length === 0) return [];

	const tokens = arpaPhonemes.map(parseArpaToken);
	const nuclei = countNuclei(tokens);

	const insertBeforeIndexToMarkers = new Map<number, string[]>();
	let primaryPlaced = false;

	for (let j = 0; j < tokens.length; j++) {
		const t = tokens[j];
		if (t.type !== "vowel") continue;
		if (t.stress === undefined) continue;
		if (nuclei <= 1) continue;

		if (t.stress === 1) {
			if (primaryPlaced) continue;
			primaryPlaced = true;
		}

		const marker = t.stress === 1 ? "ˈ" : t.stress === 2 ? "ˌ" : undefined;
		if (!marker) continue;

		let prevVowelIdx = -1;
		for (let k = j - 1; k >= 0; k--) {
			if (tokens[k].type === "vowel") {
				prevVowelIdx = k;
				break;
			}
		}
		const insertBeforeIdx = prevVowelIdx + 1;
		const bucket = insertBeforeIndexToMarkers.get(insertBeforeIdx) ?? [];
		bucket.push(marker);
		insertBeforeIndexToMarkers.set(insertBeforeIdx, bucket);
	}

	const output: string[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const markers = insertBeforeIndexToMarkers.get(i);
		if (markers) {
			for (const m of markers) output.push(m);
		}

		const raw = arpaPhonemes[i];
		const ipa = mapArpaToIpa(raw);
		output.push(ipa);
	}

	return output;
}
