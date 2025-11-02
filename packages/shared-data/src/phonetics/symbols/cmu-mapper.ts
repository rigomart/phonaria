import type { PhonemeSymbolArpa, PhonemeSymbolId } from "./registry";
import { phonemeSymbolByArpa } from "./registry";

const cmuArpaToStandardArpa: Record<string, PhonemeSymbolArpa> = {
	AH0: "AX",
	ER0: "ER",
};

const cmuArpaToPhonemeId: Record<string, PhonemeSymbolId> = {
	AH0: "mid-central-unrounded",
	ER0: "mid-central-rhotic-lax",
};

// Transforms <char><optional-char><optional-stress-digit> to <char><optional-char>
export function convertCmuArpaToStandardArpa(cmuSymbol: string): PhonemeSymbolArpa {
	const override = cmuArpaToStandardArpa[cmuSymbol];
	if (override) return override;

	const base = cmuSymbol.replace(/[0-2]$/, "") as PhonemeSymbolArpa;
	const phoneme = phonemeSymbolByArpa.get(base);

	if (!phoneme) {
		throw new Error(`Unknown CMU ARPABET symbol: ${cmuSymbol}`);
	}

	return phoneme.arpa;
}

// Transforms <char><optional-char><optional-stress-digit> to <phoneme-id>
export function convertCmuArpaToPhonemeId(cmuSymbol: string): PhonemeSymbolId {
	const override = cmuArpaToPhonemeId[cmuSymbol];
	if (override) return override;

	const base = cmuSymbol.replace(/[0-2]$/, "") as PhonemeSymbolArpa;
	const phoneme = phonemeSymbolByArpa.get(base);

	if (!phoneme) {
		throw new Error(`Unknown CMU ARPABET symbol: ${cmuSymbol}`);
	}

	return phoneme.id;
}
