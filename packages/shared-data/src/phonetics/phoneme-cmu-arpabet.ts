import type { PhonemeArpa, PhonemeCore, PhonemeId } from "./phoneme-core";
import { allPhonemesCore, getPhonemeByIdCore } from "./phoneme-core";

const STANDARD_TO_CMU_BASE: Partial<Record<PhonemeArpa, string>> = {
	AX: "AH",
};

function isVowelArpa(arpa: string): boolean {
	const vowelBases = [
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
	];
	const base = arpa.replace(/[0-2]$/, "");
	return vowelBases.includes(base);
}

export function toCmuArpabet(phoneme: PhonemeCore, stress: 0 | 1 | 2 = 0): string {
	const base = STANDARD_TO_CMU_BASE[phoneme.arpa] ?? phoneme.arpa;

	if (isVowelArpa(phoneme.arpa)) {
		return `${base}${stress}`;
	}

	return base;
}

export function toCmuArpabetById(phonemeId: PhonemeId, stress: 0 | 1 | 2 = 0): string | undefined {
	const phoneme = getPhonemeByIdCore(phonemeId);
	if (!phoneme) return undefined;
	return toCmuArpabet(phoneme, stress);
}

export type ParsedCmuArpabet = {
	arpa: string;
	stress?: 0 | 1 | 2;
};

export function fromCmuArpabet(cmuSymbol: string): ParsedCmuArpabet {
	const match = cmuSymbol.match(/^([A-Z]+)([0-2])$/);

	if (!match) {
		return { arpa: cmuSymbol };
	}

	const [, base, stressChar] = match;
	const stress = Number(stressChar) as 0 | 1 | 2;

	const arpa = base === "AH" && stress === 0 ? "AX" : base;

	return { arpa, stress };
}

export function findPhonemeFromCmuArpabet(cmuSymbol: string): PhonemeCore | undefined {
	const { arpa } = fromCmuArpabet(cmuSymbol);
	return allPhonemesCore.find((p) => p.arpa === arpa);
}

export function convertCmuTranscriptionToStandardArpa(cmuTranscription: string[]): string[] {
	return cmuTranscription.map((symbol) => fromCmuArpabet(symbol).arpa);
}

export function convertStandardArpaTranscriptionToCmu(
	arpaSymbols: { symbol: string; stress?: 0 | 1 | 2 }[],
): string[] {
	return arpaSymbols.map(({ symbol, stress = 0 }) => {
		const phoneme = allPhonemesCore.find((p) => p.arpa === symbol);
		if (!phoneme) return symbol;
		return toCmuArpabet(phoneme, stress);
	});
}
