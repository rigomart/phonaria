import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";

/** Azure's en-US IPA phone set. Each symbol maps to the phoneme IDs it stands for, in order. */
export const AzureIpaPhonemeMap: Readonly<Record<string, readonly EnglishPhonemeSymbolId[]>> = {
	i: ["I"],
	ɪ: ["IX"],
	eɪ: ["EI"],
	ɛ: ["E"],
	æ: ["AE"],
	ɑ: ["A"],
	ɔ: ["O"],
	ʊ: ["UX"],
	oʊ: ["OU"],
	u: ["U"],
	ʌ: ["AH"],
	aɪ: ["AI"],
	aʊ: ["AU"],
	ɔɪ: ["OI"],
	ə: ["AX"],
	ɝ: ["ER"],
	ɚ: ["ER"],

	w: ["W"],
	j: ["Y"],
	p: ["P"],
	b: ["B"],
	t: ["T"],
	d: ["D"],
	k: ["K"],
	// Azure writes ASCII g; ɡ is the IPA letter Phonaria uses.
	g: ["G"],
	ɡ: ["G"],
	m: ["M"],
	n: ["N"],
	ŋ: ["NG"],
	f: ["F"],
	v: ["V"],
	θ: ["TH"],
	ð: ["DH"],
	s: ["S"],
	z: ["Z"],
	ʃ: ["SH"],
	ʒ: ["ZH"],
	h: ["H"],
	tʃ: ["CH"],
	dʒ: ["J"],
	l: ["L"],
	ɹ: ["R"],

	// Units Azure scores as one sound but Phonaria writes as two.
	ju: ["Y", "U"],
	ɪɹ: ["IX", "R"],
	ɛɹ: ["E", "R"],
	ʊɹ: ["UX", "R"],
	aɪɹ: ["AI", "R"],
	aʊɹ: ["AU", "R"],
	ɔɹ: ["O", "R"],
	ɑɹ: ["A", "R"],
};

const symbolMap = new Map(Object.entries(AzureIpaPhonemeMap));

/** The phoneme IDs an Azure symbol stands for, or null when it has no mapping. */
export function phonemeIdsForAzureSymbol(symbol: string): readonly EnglishPhonemeSymbolId[] | null {
	return symbolMap.get(symbol) ?? null;
}
