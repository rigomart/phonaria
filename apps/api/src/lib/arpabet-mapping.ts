/**
 * ARPAbet to IPA Phoneme Mapping
 * Based on CMU Pronouncing Dictionary ARPAbet symbols
 */

export const ARPABET_TO_IPA: Record<string, string> = {
	// Vowels with stress variants (0=unstressed, 1=primary, 2=secondary)
	AA: "ɑ",
	AA0: "ɑ",
	AA1: "ɑ",
	AA2: "ɑ", // father, cot
	AE: "æ",
	AE0: "æ",
	AE1: "æ",
	AE2: "æ", // cat, bat
	AH: "ʌ",
	AH0: "ə",
	AH1: "ʌ",
	AH2: "ʌ", // cut, about (AH0=schwa)
	AO: "ɔ",
	AO0: "ɔ",
	AO1: "ɔ",
	AO2: "ɔ", // caught, thought
	AW: "aʊ",
	AW0: "aʊ",
	AW1: "aʊ",
	AW2: "aʊ", // cow, about
	AY: "aɪ",
	AY0: "aɪ",
	AY1: "aɪ",
	AY2: "aɪ", // my, sight
	EH: "ɛ",
	EH0: "ɛ",
	EH1: "ɛ",
	EH2: "ɛ", // bet, red
	ER: "ɝ",
	ER0: "ɚ",
	ER1: "ɝ",
	ER2: "ɝ", // bird (ER0=unstressed)
	EY: "eɪ",
	EY0: "eɪ",
	EY1: "eɪ",
	EY2: "eɪ", // say, eight
	IH: "ɪ",
	IH0: "ɪ",
	IH1: "ɪ",
	IH2: "ɪ", // bit, hit
	IY: "i",
	IY0: "i",
	IY1: "i",
	IY2: "i", // beat, see
	OW: "oʊ",
	OW0: "oʊ",
	OW1: "oʊ",
	OW2: "oʊ", // go, boat
	OY: "ɔɪ",
	OY0: "ɔɪ",
	OY1: "ɔɪ",
	OY2: "ɔɪ", // boy, toy
	UH: "ʊ",
	UH0: "ʊ",
	UH1: "ʊ",
	UH2: "ʊ", // book, could
	UW: "u",
	UW0: "u",
	UW1: "u",
	UW2: "u", // boot, two

	// Consonants
	B: "b", // bat
	CH: "tʃ", // church
	D: "d", // dog
	DH: "ð", // this
	F: "f", // fish
	G: "ɡ", // go (IPA script g, U+0261)
	HH: "h", // house
	JH: "dʒ", // judge
	K: "k", // cat
	L: "l", // let
	M: "m", // man
	N: "n", // no
	NG: "ŋ", // sing
	P: "p", // pen
	R: "ɹ", // red (American r)
	S: "s", // see
	SH: "ʃ", // she
	T: "t", // top
	TH: "θ", // think
	V: "v", // very
	W: "w", // wet
	Y: "j", // yes
	Z: "z", // zoo
	ZH: "ʒ", // measure
};

/**
 * Convert ARPAbet phonemes to IPA with stress markers
 */
export function convertArpabetToIPA(arpaPhonemes: string[]): string[] {
	const result: string[] = [];

	for (const arpa of arpaPhonemes) {
		if (arpa.endsWith("1")) {
			result.push("ˈ"); // Primary stress
			result.push(ARPABET_TO_IPA[arpa] || arpa);
		} else if (arpa.endsWith("2")) {
			result.push("ˌ"); // Secondary stress
			result.push(ARPABET_TO_IPA[arpa] || arpa);
		} else {
			result.push(ARPABET_TO_IPA[arpa] || arpa);
		}
	}

	return result;
}
