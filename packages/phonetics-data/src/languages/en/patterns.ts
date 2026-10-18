// Common spelling patterns for English phonemes
// Because English spelling is historically inconsistent, these represent general tendencies rather than fixed rules

import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";
import type { SpellingPattern } from "../types";

//? Future:examples should be per pattern, also add fields for position (coda, onset, etc.)

export const EnglishPhonemeSpellingPatterns = deepFreeze({
	// Plosives
	P: {
		patterns: ["p", "pp"],
		examples: [
			{ word: "pat", phonemic: "pæt", spelled: "[p]at" },
			{ word: "happy", phonemic: "ˈhæpi", spelled: "ha[pp]y" },
		],
	},
	B: {
		patterns: ["b", "bb"],
		examples: [
			{ word: "bat", phonemic: "bæt", spelled: "[b]at" },
			{ word: "rabbit", phonemic: "ˈɹæbət", spelled: "ra[bb]it" },
		],
	},
	T: {
		patterns: ["t", "tt", "-ed"],
		examples: [
			{ word: "top", phonemic: "tɑp", spelled: "[t]op" },
			{ word: "letter", phonemic: "ˈlɛtɝ", spelled: "le[tt]er" },
			{ word: "jumped", phonemic: "dʒʌmpt", spelled: "jump[ed]" },
		],
	},
	D: {
		patterns: ["d", "dd", "-ed"],
		examples: [
			{ word: "day", phonemic: "deɪ", spelled: "[d]ay" },
			{ word: "ladder", phonemic: "ˈlædɝ", spelled: "la[dd]er" },
			{ word: "rained", phonemic: "ɹeɪnd", spelled: "rain[ed]" },
		],
	},
	K: {
		patterns: ["c", "k", "ck"],
		examples: [
			{ word: "cat", phonemic: "kæt", spelled: "[c]at" },
			{ word: "kid", phonemic: "kɪd", spelled: "[k]id" },
			{ word: "back", phonemic: "bæk", spelled: "ba[ck]" },
		],
	},
	G: {
		patterns: ["g", "gg"],
		examples: [
			{ word: "gum", phonemic: "ɡʌm", spelled: "[g]um" },
			{ word: "bigger", phonemic: "ˈbɪɡɝ", spelled: "bi[gg]er" },
		],
	},

	// Nasals
	M: {
		patterns: ["m", "mm"],
		examples: [
			{ word: "ram", phonemic: "ræm", spelled: "ra[m]" },
			{ word: "summer", phonemic: "ˈsʌmɝ", spelled: "su[mm]er" },
		],
	},
	N: {
		patterns: ["n", "nn", "kn-"],
		examples: [
			{ word: "sun", phonemic: "sʌn", spelled: "su[n]" },
			{ word: "dinner", phonemic: "ˈdɪnɝ", spelled: "di[nn]er" },
			{ word: "know", phonemic: "noʊ", spelled: "[kn]ow" },
		],
	},
	NG: {
		patterns: ["-ng", "n"],
		examples: [
			{ word: "sing", phonemic: "sɪŋ", spelled: "si[ng]" },
			{ word: "think", phonemic: "θɪŋk", spelled: "thi[n]k" },
		],
	},

	// Liquids & Approximants
	L: {
		patterns: ["l", "ll"],
		examples: [
			{ word: "let", phonemic: "lɛt", spelled: "[l]et" },
			{ word: "hello", phonemic: "həˈloʊ", spelled: "he[ll]o" },
		],
	},
	R: {
		patterns: ["r", "rr", "wr-"],
		examples: [
			{ word: "red", phonemic: "ɹɛd", spelled: "[r]ed" },
			{ word: "write", phonemic: "ɹaɪt", spelled: "[wr]ite" },
		],
	},
	W: {
		patterns: ["w"],
		examples: [
			{ word: "west", phonemic: "wɛst", spelled: "[w]est" },
			{ word: "away", phonemic: "əˈweɪ", spelled: "a[w]ay" },
		],
	},
	Y: {
		patterns: ["y"],
		examples: [
			{ word: "yoke", phonemic: "joʊk", spelled: "[y]oke" },
			{ word: "you", phonemic: "ju", spelled: "[y]ou" },
		],
	},

	// Fricatives
	F: {
		patterns: ["f", "ff", "ph"],
		examples: [
			{ word: "fan", phonemic: "fæn", spelled: "[f]an" },
			{ word: "coffee", phonemic: "ˈkɔfi", spelled: "co[ff]ee" },
			{ word: "phone", phonemic: "foʊn", spelled: "[ph]one" },
		],
	},
	V: {
		patterns: ["v"],
		examples: [
			{ word: "van", phonemic: "væn", spelled: "[v]an" },
			{ word: "save", phonemic: "seɪv", spelled: "sa[v]e" },
		],
	},
	TH: {
		patterns: ["th"],
		examples: [
			{ word: "thin", phonemic: "θɪn", spelled: "[th]in" },
			{ word: "think", phonemic: "θɪŋk", spelled: "[th]ink" },
		],
	},
	DH: {
		patterns: ["th"],
		examples: [
			{ word: "this", phonemic: "ðɪs", spelled: "[th]is" },
			{ word: "mother", phonemic: "ˈmʌðɝ", spelled: "mo[th]er" },
		],
	},
	S: {
		patterns: ["s", "ss", "c"],
		examples: [
			{ word: "sun", phonemic: "sʌn", spelled: "[s]un" },
			{ word: "city", phonemic: "ˈsɪti", spelled: "[c]ity" },
		],
	},
	Z: {
		patterns: ["z", "-s", "zz"],
		examples: [
			{ word: "zoo", phonemic: "zu", spelled: "[z]oo" },
			{ word: "dogs", phonemic: "dɔɡz", spelled: "dog[s]" },
			{ word: "buzz", phonemic: "bʌz", spelled: "bu[zz]" },
		],
	},
	SH: {
		patterns: ["sh", "-tion", "-sion"],
		examples: [
			{ word: "shop", phonemic: "ʃɑp", spelled: "[sh]op" },
			{ word: "nation", phonemic: "ˈneɪʃən", spelled: "na[ti]on" },
		],
	},
	ZH: {
		patterns: ["-sion", "-sure"],
		examples: [
			{ word: "vision", phonemic: "ˈvɪʒən", spelled: "vi[si]on" },
			{ word: "measure", phonemic: "ˈmɛʒɝ", spelled: "mea[s]ure" },
		],
	},
	H: {
		patterns: ["h"],
		examples: [
			{ word: "house", phonemic: "haʊs", spelled: "[h]ouse" },
			{ word: "hello", phonemic: "həˈloʊ", spelled: "[h]ello" },
		],
	},

	// Affricates
	CH: {
		patterns: ["ch", "tch"],
		examples: [
			{ word: "cheap", phonemic: "tʃip", spelled: "[ch]eap" },
			{ word: "catch", phonemic: "kætʃ", spelled: "ca[tch]" },
		],
	},
	J: {
		patterns: ["j", "-dge", "-ge"],
		examples: [
			{ word: "jeep", phonemic: "dʒip", spelled: "[j]eep" },
			{ word: "bridge", phonemic: "bɹɪdʒ", spelled: "bri[dge]" },
			{ word: "page", phonemic: "peɪdʒ", spelled: "pa[ge]" },
		],
	},

	// Monophthongs - High Vowels
	I: {
		patterns: ["ee", "ea", "-y", "e"],
		examples: [
			{ word: "seed", phonemic: "sid", spelled: "s[ee]d" },
			{ word: "sea", phonemic: "si", spelled: "s[ea]" },
			{ word: "happy", phonemic: "ˈhæpi", spelled: "happ[y]" },
			{ word: "be", phonemic: "bi", spelled: "b[e]" },
		],
	},
	IX: {
		patterns: ["i"],
		examples: [
			{ word: "sit", phonemic: "sɪt", spelled: "s[i]t" },
			{ word: "big", phonemic: "bɪɡ", spelled: "b[i]g" },
		],
	},
	U: {
		patterns: ["oo", "u-e", "ew"],
		examples: [
			{ word: "food", phonemic: "fud", spelled: "f[oo]d" },
			{ word: "mood", phonemic: "mud", spelled: "m[oo]d" },
			{ word: "new", phonemic: "nu", spelled: "n[ew]" },
		],
	},
	UX: {
		patterns: ["oo", "u"],
		examples: [
			{ word: "book", phonemic: "bʊk", spelled: "b[oo]k" },
			{ word: "put", phonemic: "pʊt", spelled: "p[u]t" },
		],
	},

	// Monophthongs - Mid Vowels
	E: {
		patterns: ["e", "ea"],
		examples: [
			{ word: "red", phonemic: "ɹɛd", spelled: "r[e]d" },
			{ word: "bread", phonemic: "bɹɛd", spelled: "br[ea]d" },
		],
	},
	AX: {
		patterns: ["a", "e", "o"],
		examples: [
			{ word: "sofa", phonemic: "ˈsoʊfə", spelled: "sof[a]" },
			{ word: "lemon", phonemic: "ˈlɛmən", spelled: "lem[o]n" },
		],
	},
	AH: {
		patterns: ["u", "o"],
		examples: [
			{ word: "cup", phonemic: "kʌp", spelled: "c[u]p" },
			{ word: "love", phonemic: "lʌv", spelled: "l[o]ve" },
		],
	},
	O: {
		patterns: ["aw", "au", "al"],
		examples: [
			{ word: "saw", phonemic: "sɔ", spelled: "s[aw]" },
			{ word: "cause", phonemic: "kɔz", spelled: "c[au]se" },
			{ word: "talk", phonemic: "tɔk", spelled: "t[al]k" },
		],
	},

	// Monophthongs - Low Vowels
	AE: {
		patterns: ["a"],
		examples: [
			{ word: "cat", phonemic: "kæt", spelled: "c[a]t" },
			{ word: "back", phonemic: "bæk", spelled: "b[a]ck" },
		],
	},
	A: {
		patterns: ["o", "a"],
		examples: [
			{ word: "hot", phonemic: "hɑt", spelled: "h[o]t" },
			{ word: "father", phonemic: "ˈfɑðɝ", spelled: "f[a]ther" },
		],
	},

	// Diphthongs
	EI: {
		patterns: ["a-e", "ai", "-ay"],
		examples: [
			{ word: "make", phonemic: "meɪk", spelled: "m[a]k[e]" },
			{ word: "rain", phonemic: "ɹeɪn", spelled: "r[ai]n" },
			{ word: "day", phonemic: "deɪ", spelled: "d[ay]" },
		],
	},
	AI: {
		patterns: ["i-e", "igh", "-y"],
		examples: [
			{ word: "time", phonemic: "taɪm", spelled: "t[i]m[e]" },
			{ word: "night", phonemic: "naɪt", spelled: "n[igh]t" },
			{ word: "my", phonemic: "maɪ", spelled: "m[y]" },
		],
	},
	OI: {
		patterns: ["oi", "-oy"],
		examples: [
			{ word: "coin", phonemic: "kɔɪn", spelled: "c[oi]n" },
			{ word: "boy", phonemic: "bɔɪ", spelled: "b[oy]" },
		],
	},
	OU: {
		patterns: ["o", "oa", "o-e"],
		examples: [
			{ word: "code", phonemic: "koʊd", spelled: "c[o]d[e]" },
			{ word: "boat", phonemic: "boʊt", spelled: "b[oa]t" },
			{ word: "home", phonemic: "hoʊm", spelled: "h[o]m[e]" },
		],
	},
	AU: {
		patterns: ["ou", "ow"],
		examples: [
			{ word: "out", phonemic: "aʊt", spelled: "[ou]t" },
			{ word: "now", phonemic: "naʊ", spelled: "n[ow]" },
		],
	},

	// R-colored vowels
	ER: {
		patterns: ["er", "ir", "ur", "or"],
		examples: [
			{ word: "her", phonemic: "hɝ", spelled: "h[er]" },
			{ word: "bird", phonemic: "bɝd", spelled: "b[ir]d" },
			{ word: "turn", phonemic: "tɝn", spelled: "t[ur]n" },
			{ word: "work", phonemic: "wɝk", spelled: "w[or]k" },
		],
	},
} as const satisfies Partial<Record<EnglishPhonemeSymbolId, SpellingPattern>>);
