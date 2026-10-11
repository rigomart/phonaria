import { EnglishPhonemeFrequencyData } from "../../data/en/phoneme-frequency";
import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";
import type { PhonemeFrequency } from "../types";

/** How common each English sound is in everyday speech, by phoneme ID. */
export const EnglishPhonemeFrequencies = deepFreeze(
	Object.fromEntries(
		EnglishPhonemeFrequencyData.phonemes.map(({ phonemeId, percentage, rank }) => [
			phonemeId,
			{ percentage, rank },
		]),
	) as Record<EnglishPhonemeSymbolId, PhonemeFrequency>,
);
