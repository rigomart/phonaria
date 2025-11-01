export type PhonemeSpellingPattern = {
	phonemeId: string;
	patterns: string[];
};

export const phonemeSpellingPatterns: Map<string, string[]> = new Map([
	["voiceless-bilabial-stop", ["p", "pp"]],
	["voiced-bilabial-stop", ["b", "bb"]],
	["voiceless-alveolar-stop", ["t", "tt", "ed"]],
	["voiced-alveolar-stop", ["d", "dd", "ed"]],
	["voiceless-velar-stop", ["c", "k", "ck", "q"]],
	["voiced-velar-stop", ["g", "gg", "gh"]],
	["voiceless-labiodental-fricative", ["f", "ff", "ph", "gh"]],
	["voiced-labiodental-fricative", ["v", "vv"]],
	["voiceless-dental-fricative", ["th"]],
	["voiced-dental-fricative", ["th"]],
	["voiceless-alveolar-fricative", ["s", "ss", "c", "sc"]],
	["voiced-alveolar-fricative", ["z", "zz", "s", "se"]],
	["voiceless-postalveolar-fricative", ["sh", "ti", "ci", "ch"]],
	["voiced-postalveolar-fricative", ["s", "si", "g", "j"]],
	["voiceless-glottal-fricative", ["h", "wh"]],
	["voiceless-postalveolar-affricate", ["ch", "tch", "t"]],
	["voiced-postalveolar-affricate", ["j", "g", "dge", "ge"]],
	["voiced-bilabial-nasal", ["m", "mm", "mb"]],
	["voiced-alveolar-nasal", ["n", "nn", "kn", "gn"]],
	["voiced-velar-nasal", ["ng", "n"]],
	["voiced-alveolar-lateral-approximant", ["l", "ll"]],
	["voiced-postalveolar-approximant", ["r", "rr", "wr"]],
	["voiced-palatal-approximant", ["y", "i", "j"]],
	["voiced-labial-velar-approximant", ["w", "wh", "u"]],
	["high-front-tense-unrounded", ["ee", "ea", "e", "ie", "y"]],
	["near-high-near-front-lax-unrounded", ["i", "y", "e", "ui"]],
	["low-mid-front-lax-unrounded", ["e", "ea", "a"]],
	["near-low-front-lax-unrounded", ["a"]],
	["mid-central-lax-unrounded", ["a", "e", "i", "o", "u"]],
	["low-mid-central-lax-unrounded", ["u", "o", "ou"]],
	["low-back-lax-unrounded", ["o", "a"]],
	["low-mid-back-tense-rounded", ["aw", "au", "o", "a"]],
	["near-high-near-back-lax-rounded", ["oo", "u", "ou"]],
	["high-back-tense-rounded", ["oo", "u", "ue", "ew", "ou"]],
	["mid-central-tense-rhotic", ["er", "ir", "ur", "or", "ear"]],
	["mid-central-lax-rhotic", ["er", "ar", "or", "ur"]],
	["high-mid-front-diphthong", ["a", "ai", "ay", "ei", "ey"]],
	["low-central-to-high-front-diphthong", ["i", "y", "ie", "igh", "uy"]],
	["low-mid-back-to-high-front-diphthong", ["oi", "oy"]],
	["low-central-to-high-back-diphthong", ["ou", "ow"]],
	["high-mid-back-diphthong", ["o", "oa", "ow", "oe"]],
]);

export function getSpellingPatterns(phonemeId: string): string[] {
	return phonemeSpellingPatterns.get(phonemeId) ?? [];
}
