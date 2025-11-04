import type { PhonemeSymbolId } from "./symbols-registry";

type PhonemeContrastPair = {
	word: string;
	phonemic: string;
};

type PhonemeContrastType =
	| "voicing"
	| "place"
	| "manner"
	| "tenseness"
	| "backness"
	| "roundness"
	| "height";

export type PhonemeContrast = {
	phonemesIds: [PhonemeSymbolId, PhonemeSymbolId]; // The pair. e.g. ["voiced-bilabial-stop", "voiced-labiodental-fricative"]
	contrastType: PhonemeContrastType[]; // Usually one, but can be multiple. e.g. ["manner", "place"]
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// TODO: Refine the contrasts for accuracy and completeness.
export const phonemeContrasts: PhonemeContrast[] = [
	// Consonants: Voicing
	{
		phonemesIds: ["voiceless-bilabial-stop", "voiced-bilabial-stop"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "pat", phonemic: "/pæt/" },
				{ word: "bat", phonemic: "/bæt/" },
			],
			[
				{ word: "rip", phonemic: "/rɪp/" },
				{ word: "rib", phonemic: "/rɪb/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-alveolar-stop", "voiced-alveolar-stop"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "ten", phonemic: "/tɛn/" },
				{ word: "den", phonemic: "/dɛn/" },
			],
			[
				{ word: "seat", phonemic: "/siːt/" },
				{ word: "seed", phonemic: "/siːd/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-velar-stop", "voiced-velar-stop"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "coat", phonemic: "/koʊt/" },
				{ word: "goat", phonemic: "/goʊt/" },
			],
			[
				{ word: "back", phonemic: "/bæk/" },
				{ word: "bag", phonemic: "/bæɡ/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-labiodental-fricative", "voiced-labiodental-fricative"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "fan", phonemic: "/fæn/" },
				{ word: "van", phonemic: "/væn/" },
			],
			[
				{ word: "safe", phonemic: "/seɪf/" },
				{ word: "save", phonemic: "/seɪv/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-alveolar-fricative", "voiced-alveolar-fricative"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "sip", phonemic: "/sɪp/" },
				{ word: "zip", phonemic: "/zɪp/" },
			],
			[
				{ word: "seal", phonemic: "/siːl/" },
				{ word: "zeal", phonemic: "/ziːl/" },
			],
		],
	},

	// Consonants: Place/Manner
	{
		phonemesIds: ["voiceless-alveolar-fricative", "voiceless-postalveolar-fricative"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sip", phonemic: "/sɪp/" },
				{ word: "ship", phonemic: "/ʃɪp/" },
			],
			[
				{ word: "mess", phonemic: "/mɛs/" },
				{ word: "mesh", phonemic: "/mɛʃ/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-postalveolar-affricate", "voiceless-postalveolar-fricative"],
		contrastType: ["manner"],
		minimalPairs: [
			[
				{ word: "cheap", phonemic: "/tʃiːp/" },
				{ word: "sheep", phonemic: "/ʃiːp/" },
			],
			[
				{ word: "chin", phonemic: "/tʃɪn/" },
				{ word: "shin", phonemic: "/ʃɪn/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-postalveolar-affricate", "voiced-postalveolar-affricate"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "cheap", phonemic: "/tʃiːp/" },
				{ word: "jeep", phonemic: "/dʒiːp/" },
			],
			[
				{ word: "chin", phonemic: "/tʃɪn/" },
				{ word: "gin", phonemic: "/dʒɪn/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-dental-fricative", "voiceless-alveolar-stop"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "thin", phonemic: "/θɪn/" },
				{ word: "tin", phonemic: "/tɪn/" },
			],
			[
				{ word: "thank", phonemic: "/θæŋk/" },
				{ word: "tank", phonemic: "/tæŋk/" },
			],
		],
	},
	{
		phonemesIds: ["voiceless-dental-fricative", "voiceless-alveolar-fricative"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "thin", phonemic: "/θɪn/" },
				{ word: "sin", phonemic: "/sɪn/" },
			],
			[
				{ word: "think", phonemic: "/θɪŋk/" },
				{ word: "sink", phonemic: "/sɪŋk/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-dental-fricative", "voiced-alveolar-stop"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "they", phonemic: "/ðeɪ/" },
				{ word: "day", phonemic: "/deɪ/" },
			],
			[
				{ word: "though", phonemic: "/ðoʊ/" },
				{ word: "dough", phonemic: "/doʊ/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-dental-fricative", "voiced-alveolar-fricative"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "breathe", phonemic: "/briːð/" },
				{ word: "breeze", phonemic: "/briːz/" },
			],
			[
				{ word: "seethe", phonemic: "/siːð/" },
				{ word: "seize", phonemic: "/siːz/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-alveolar-nasal", "voiced-velar-nasal"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "ban", phonemic: "/bæn/" },
				{ word: "bang", phonemic: "/bæŋ/" },
			],
			[
				{ word: "sun", phonemic: "/sʌn/" },
				{ word: "sung", phonemic: "/sʌŋ/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-bilabial-nasal", "voiced-alveolar-nasal"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sum", phonemic: "/sʌm/" },
				{ word: "sun", phonemic: "/sʌn/" },
			],
			[
				{ word: "ram", phonemic: "/ræm/" },
				{ word: "ran", phonemic: "/ræn/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-labial-velar-approximant", "voiced-labiodental-fricative"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "wine", phonemic: "/waɪn/" },
				{ word: "vine", phonemic: "/vaɪn/" },
			],
			[
				{ word: "west", phonemic: "/wɛst/" },
				{ word: "vest", phonemic: "/vɛst/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-alveolar-lateral-approximant", "voiced-postalveolar-approximant"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "led", phonemic: "/lɛd/" },
				{ word: "red", phonemic: "/rɛd/" },
			],
			[
				{ word: "light", phonemic: "/laɪt/" },
				{ word: "right", phonemic: "/raɪt/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-palatal-approximant", "voiced-postalveolar-affricate"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "yoke", phonemic: "/joʊk/" },
				{ word: "joke", phonemic: "/dʒoʊk/" },
			],
			[
				{ word: "year", phonemic: "/jɪr/" },
				{ word: "jeer", phonemic: "/dʒɪr/" },
			],
		],
	},
	{
		phonemesIds: ["voiced-bilabial-stop", "voiced-labiodental-fricative"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "best", phonemic: "/best/" },
				{ word: "vest", phonemic: "/vest/" },
			],
		],
	},

	// Vowels: Height/Backness/Roundness/Tenseness ---
	{
		phonemesIds: ["close-front-unrounded", "near-close-near-front-unrounded"], // /i/ vs /ɪ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "beet", phonemic: "/bit/" },
				{ word: "bit", phonemic: "/bɪt/" },
			],
			[
				{ word: "seat", phonemic: "/sit/" },
				{ word: "sit", phonemic: "/sɪt/" },
			],
		],
	},
	{
		phonemesIds: ["close-back-rounded", "near-close-near-back-rounded"], // /u/ vs /ʊ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "pool", phonemic: "/pul/" },
				{ word: "pull", phonemic: "/pʊl/" },
			],
			[
				{ word: "Luke", phonemic: "/luk/" },
				{ word: "look", phonemic: "/lʊk/" },
			],
		],
	},
	{
		phonemesIds: ["open-mid-front-unrounded", "near-open-front-unrounded"], // /ɛ/ vs /æ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "bet", phonemic: "/bɛt/" },
				{ word: "bat", phonemic: "/bæt/" },
			],
			[
				{ word: "men", phonemic: "/mɛn/" },
				{ word: "man", phonemic: "/mæn/" },
			],
		],
	},
	{
		phonemesIds: ["near-close-near-back-rounded", "open-mid-back-unrounded"], // /ʊ/ vs /ʌ/
		contrastType: ["height", "roundness"],
		minimalPairs: [
			[
				{ word: "put", phonemic: "/pʊt/" },
				{ word: "putt", phonemic: "/pʌt/" },
			],
			[
				{ word: "book", phonemic: "/bʊk/" },
				{ word: "buck", phonemic: "/bʌk/" },
			],
		],
	},
	{
		phonemesIds: ["open-mid-back-unrounded", "open-back-unrounded"], // /ʌ/ vs /ɑ/
		contrastType: ["height", "backness"],
		minimalPairs: [
			[
				{ word: "cup", phonemic: "/kʌp/" },
				{ word: "cop", phonemic: "/kɑp/" },
			],
			[
				{ word: "luck", phonemic: "/lʌk/" },
				{ word: "lock", phonemic: "/lɑk/" },
			],
		],
	},

	// Diphthong vs Monophthong: Tense–Lax/Height cues
	{
		phonemesIds: [
			"close-mid-front-unrounded-to-near-close-near-front-unrounded",
			"open-mid-front-unrounded",
		], // /eɪ/ vs /ɛ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "bait", phonemic: "/beɪt/" },
				{ word: "bet", phonemic: "/bɛt/" },
			],
			[
				{ word: "late", phonemic: "/leɪt/" },
				{ word: "let", phonemic: "/lɛt/" },
			],
		],
	},
	{
		phonemesIds: ["close-mid-back-rounded-to-near-close-near-back-rounded", "open-back-unrounded"], // /oʊ/ vs /ɑ/
		contrastType: ["roundness", "height"],
		minimalPairs: [
			[
				{ word: "coat", phonemic: "/koʊt/" },
				{ word: "cot", phonemic: "/kɑt/" },
			],
			[
				{ word: "rode", phonemic: "/roʊd/" },
				{ word: "rod", phonemic: "/rɑd/" },
			],
		],
	},

	// Diphthong vs Diphthong: Height cues
	{
		phonemesIds: [
			"open-front-unrounded-to-near-close-near-front-unrounded",
			"close-mid-front-unrounded-to-near-close-near-front-unrounded",
		], // /aɪ/ vs /eɪ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "time", phonemic: "/taɪm/" },
				{ word: "tame", phonemic: "/teɪm/" },
			],
			[
				{ word: "line", phonemic: "/laɪn/" },
				{ word: "lane", phonemic: "/leɪn/" },
			],
		],
	},
	{
		phonemesIds: [
			"open-front-unrounded-to-near-close-near-front-unrounded",
			"open-front-unrounded-to-near-close-near-back-rounded",
		], // /aɪ/ vs /aʊ/
		contrastType: ["roundness", "backness"],
		minimalPairs: [
			[
				{ word: "file", phonemic: "/faɪl/" },
				{ word: "foul", phonemic: "/faʊl/" },
			],
			[
				{ word: "buy", phonemic: "/baɪ/" },
				{ word: "bough", phonemic: "/baʊ/" },
			],
		],
	},
	{
		phonemesIds: [
			"close-mid-back-rounded-to-near-close-near-back-rounded",
			"open-front-unrounded-to-near-close-near-back-rounded",
		], // /oʊ/ vs /aʊ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "know", phonemic: "/noʊ/" },
				{ word: "now", phonemic: "/naʊ/" },
			],
			[
				{ word: "coat", phonemic: "/koʊt/" },
				{ word: "cow", phonemic: "/kaʊ/" },
			],
		],
	},
	{
		phonemesIds: [
			"open-mid-back-rounded-to-near-close-near-front-unrounded",
			"close-mid-back-rounded-to-near-close-near-back-rounded",
		], // /ɔɪ/ vs /oʊ/
		contrastType: ["backness", "roundness"],
		minimalPairs: [
			[
				{ word: "boil", phonemic: "/bɔɪl/" },
				{ word: "bowl", phonemic: "/boʊl/" },
			],
			[
				{ word: "toil", phonemic: "/tɔɪl/" },
				{ word: "toll", phonemic: "/toʊl/" },
			],
		],
	},
];
