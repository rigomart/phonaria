export const ARPABET_TO_IPA: Record<string, string> = {
	AA: "ɑ",
	AA0: "ɑ",
	AA1: "ɑ",
	AA2: "ɑ",
	AE: "æ",
	AE0: "æ",
	AE1: "æ",
	AE2: "æ",
	AH: "ʌ",
	AH0: "ə",
	AH1: "ʌ",
	AH2: "ʌ",
	AO: "ɔ",
	AO0: "ɔ",
	AO1: "ɔ",
	AO2: "ɔ",
	AW: "aʊ",
	AW0: "aʊ",
	AW1: "aʊ",
	AW2: "aʊ",
	AY: "aɪ",
	AY0: "aɪ",
	AY1: "aɪ",
	AY2: "aɪ",
	EH: "ɛ",
	EH0: "ɛ",
	EH1: "ɛ",
	EH2: "ɛ",
	ER: "ɝ",
	ER0: "ɚ",
	ER1: "ɝ",
	ER2: "ɝ",
	EY: "eɪ",
	EY0: "eɪ",
	EY1: "eɪ",
	EY2: "eɪ",
	IH: "ɪ",
	IH0: "ɪ",
	IH1: "ɪ",
	IH2: "ɪ",
	IY: "i",
	IY0: "i",
	IY1: "i",
	IY2: "i",
	OW: "oʊ",
	OW0: "oʊ",
	OW1: "oʊ",
	OW2: "oʊ",
	OY: "ɔɪ",
	OY0: "ɔɪ",
	OY1: "ɔɪ",
	OY2: "ɔɪ",
	UH: "ʊ",
	UH0: "ʊ",
	UH1: "ʊ",
	UH2: "ʊ",
	UW: "u",
	UW0: "u",
	UW1: "u",
	UW2: "u",
	B: "b",
	CH: "tʃ",
	D: "d",
	DH: "ð",
	F: "f",
	G: "ɡ",
	HH: "h",
	JH: "dʒ",
	K: "k",
	L: "l",
	M: "m",
	N: "n",
	NG: "ŋ",
	P: "p",
	R: "ɹ",
	S: "s",
	SH: "ʃ",
	T: "t",
	TH: "θ",
	V: "v",
	W: "w",
	Y: "j",
	Z: "z",
	ZH: "ʒ",
};

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

type StressLevel = 0 | 1 | 2;
type PhonemeType = "vowel" | "consonant";

interface ArpaToken {
	base: string;
	stress?: StressLevel;
	type: PhonemeType;
}

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

function countNuclei(tokens: ArpaToken[]): number {
	return tokens.reduce((count, token) => (token.type === "vowel" ? count + 1 : count), 0);
}

function findOnsetStartIndex(tokens: ArpaToken[], vowelIdx: number): number {
	let i = vowelIdx - 1;
	while (i >= 0 && tokens[i].type === "consonant") {
		i--;
	}

	const clusterStart = i + 1;
	const available = vowelIdx - clusterStart;
	if (available <= 0) return vowelIdx;

	const secondSet = new Set(["R", "L", "W", "Y"]);
	const sptk = new Set(["P", "T", "K"]);
	const firstSet = new Set([
		"P",
		"B",
		"T",
		"D",
		"K",
		"G",
		"F",
		"V",
		"TH",
		"S",
		"SH",
		"CH",
		"JH",
		"HH",
		"M",
		"N",
	]);

	if (available >= 3) {
		const a = tokens[vowelIdx - 3]?.base;
		const b = tokens[vowelIdx - 2]?.base;
		const c = tokens[vowelIdx - 1]?.base;
		if (a === "S" && sptk.has(b) && secondSet.has(c)) {
			return vowelIdx - 3;
		}
	}

	if (available >= 2) {
		const a = tokens[vowelIdx - 2]?.base;
		const b = tokens[vowelIdx - 1]?.base;
		if (a === "S" && sptk.has(b)) {
			return vowelIdx - 2;
		}
		if (firstSet.has(a) && secondSet.has(b)) {
			return vowelIdx - 2;
		}
	}

	return vowelIdx - 1;
}

function mapArpaToIpa(raw: string): string {
	return (
		ARPABET_TO_IPA[raw] ||
		ARPABET_TO_IPA[raw.replace(/[0-2]$/, "")] ||
		CONSONANT_FALLBACK[raw] ||
		raw
	);
}

export function convertArpabetToIPA(arpaPhonemes: string[]): string[] {
	if (arpaPhonemes.length === 0) {
		return [];
	}

	const tokens = arpaPhonemes.map(parseArpaToken);
	const nuclei = countNuclei(tokens);

	const insertBeforeIndexToMarkers = new Map<number, string[]>();
	let primaryPlaced = false;

	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];
		if (token.type !== "vowel") continue;
		if (token.stress === undefined) continue;
		if (nuclei <= 1) continue;

		if (token.stress === 1) {
			if (primaryPlaced) continue;
			primaryPlaced = true;
		}

		const marker = token.stress === 1 ? "ˈ" : token.stress === 2 ? "ˌ" : undefined;
		if (!marker) continue;

		const insertBeforeIdx = findOnsetStartIndex(tokens, index);
		const bucket = insertBeforeIndexToMarkers.get(insertBeforeIdx) ?? [];
		bucket.push(marker);
		insertBeforeIndexToMarkers.set(insertBeforeIdx, bucket);
	}

	const output: string[] = [];
	for (let index = 0; index < tokens.length; index++) {
		const markers = insertBeforeIndexToMarkers.get(index);
		if (markers) {
			for (const marker of markers) {
				output.push(marker);
			}
		}

		const raw = arpaPhonemes[index];
		const ipa = mapArpaToIpa(raw);
		output.push(ipa);
	}

	return output;
}
