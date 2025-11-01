export type PhonemeCore = {
	id: string;
	ipa: string;
	arpa: string;
};

export const consonantPhonemesCore: PhonemeCore[] = [
	{ id: "voiceless-bilabial-stop", ipa: "p", arpa: "P" },
	{ id: "voiced-bilabial-stop", ipa: "b", arpa: "B" },
	{ id: "voiceless-alveolar-stop", ipa: "t", arpa: "T" },
	{ id: "voiced-alveolar-stop", ipa: "d", arpa: "D" },
	{ id: "voiced-velar-stop", ipa: "ɡ", arpa: "G" },
	{ id: "voiceless-velar-stop", ipa: "k", arpa: "K" },
	{ id: "voiced-dental-fricative", ipa: "ð", arpa: "DH" },
	{ id: "voiceless-dental-fricative", ipa: "θ", arpa: "TH" },
	{ id: "voiceless-labiodental-fricative", ipa: "f", arpa: "F" },
	{ id: "voiced-labiodental-fricative", ipa: "v", arpa: "V" },
	{ id: "voiceless-glottal-fricative", ipa: "h", arpa: "HH" },
	{ id: "voiceless-alveolar-fricative", ipa: "s", arpa: "S" },
	{ id: "voiceless-postalveolar-fricative", ipa: "ʃ", arpa: "SH" },
	{ id: "voiced-alveolar-fricative", ipa: "z", arpa: "Z" },
	{ id: "voiced-postalveolar-fricative", ipa: "ʒ", arpa: "ZH" },
	{ id: "voiced-postalveolar-affricate", ipa: "dʒ", arpa: "JH" },
	{ id: "voiceless-postalveolar-affricate", ipa: "tʃ", arpa: "CH" },
	{ id: "voiced-bilabial-nasal", ipa: "m", arpa: "M" },
	{ id: "voiced-alveolar-nasal", ipa: "n", arpa: "N" },
	{ id: "voiced-velar-nasal", ipa: "ŋ", arpa: "NG" },
	{ id: "voiced-alveolar-lateral-approximant", ipa: "l", arpa: "L" },
	{ id: "voiced-postalveolar-approximant", ipa: "ɹ", arpa: "R" },
	{ id: "voiced-palatal-approximant", ipa: "j", arpa: "Y" },
	{ id: "voiced-labial-velar-approximant", ipa: "w", arpa: "W" },
];

export const vowelPhonemesCore: PhonemeCore[] = [
	{ id: "high-front-tense-unrounded", ipa: "i", arpa: "IY" },
	{ id: "near-high-near-front-lax-unrounded", ipa: "ɪ", arpa: "IH" },
	{ id: "low-mid-front-lax-unrounded", ipa: "ɛ", arpa: "EH" },
	{ id: "near-low-front-lax-unrounded", ipa: "æ", arpa: "AE" },
	{ id: "mid-central-lax-unrounded", ipa: "ə", arpa: "AH" },
	{ id: "low-mid-central-lax-unrounded", ipa: "ʌ", arpa: "AH" },
	{ id: "low-back-lax-unrounded", ipa: "ɑ", arpa: "AA" },
	{ id: "low-mid-back-tense-rounded", ipa: "ɔ", arpa: "AO" },
	{ id: "near-high-near-back-lax-rounded", ipa: "ʊ", arpa: "UH" },
	{ id: "high-back-tense-rounded", ipa: "u", arpa: "UW" },
	{ id: "mid-central-tense-rhotic", ipa: "ɝ", arpa: "ER" },
	{ id: "mid-central-lax-rhotic", ipa: "ɚ", arpa: "ER" },
	{ id: "high-mid-front-diphthong", ipa: "eɪ", arpa: "EY" },
	{ id: "low-central-to-high-front-diphthong", ipa: "aɪ", arpa: "AY" },
	{ id: "low-mid-back-to-high-front-diphthong", ipa: "ɔɪ", arpa: "OY" },
	{ id: "low-central-to-high-back-diphthong", ipa: "aʊ", arpa: "AW" },
	{ id: "high-mid-back-diphthong", ipa: "oʊ", arpa: "OW" },
];

export const allPhonemesCore: PhonemeCore[] = [...consonantPhonemesCore, ...vowelPhonemesCore];

export function getPhonemeByIdCore(id: string): PhonemeCore | undefined {
	return allPhonemesCore.find((p) => p.id === id);
}

export function getPhonemeByIpaCore(ipa: string): PhonemeCore | undefined {
	return allPhonemesCore.find((p) => p.ipa === ipa);
}

export function getPhonemeByArpaCore(arpa: string): PhonemeCore | undefined {
	return allPhonemesCore.find((p) => p.arpa === arpa);
}
