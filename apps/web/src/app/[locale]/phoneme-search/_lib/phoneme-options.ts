import {
	PhonemeArpabetLabel,
	PhonemeIpaRegistry,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";

export type PhonemeOption = {
	phonemeId: PhonemeSymbolId;
	arpabet: string;
	ipa: string;
};

export const PHONEME_OPTIONS: PhonemeOption[] = Object.entries(PhonemeArpabetLabel)
	.map(([phonemeId, arpabet]) => {
		const id = phonemeId as PhonemeSymbolId;
		return {
			phonemeId: id,
			arpabet,
			ipa: PhonemeIpaRegistry[id] ?? `/${arpabet}/`,
		};
	})
	.sort((a, b) => a.arpabet.localeCompare(b.arpabet));
