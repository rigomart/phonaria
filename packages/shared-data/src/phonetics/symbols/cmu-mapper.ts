// Utilities for bridging standard ARPABET with CMUdict symbols that encode stress digits.
// CMUDict uses additional symbols for stress digits, which are not part of regular ARPABET.

import type { PhonemeSymbolArpa, PhonemeSymbolId } from "./registry";
import { phonemeSymbolByArpa } from "./registry";

// CMU-only representations that collapse to existing Phonaria symbols.
const cmuArpaToStandardArpa: Record<string, PhonemeSymbolArpa> = {
	AH0: "AX",
	ER0: "ER",
};

const cmuArpaToPhonemeId: Record<string, PhonemeSymbolId> = {
	AH0: "mid-central-unrounded",
	ER0: "mid-central-rhotic-lax",
};

/**
 * Remove CMU stress digits and map CMU-only variants onto Phonaria-standard ARPABET.
 */
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

/**
 * Resolve a CMUdict symbol to the canonical phoneme id used in the registry.
 */
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
