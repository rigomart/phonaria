import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
} from "./ipa-registry";

type PhonemeContrastPair = {
	word: string;
	phonemic: string;
};

type PhonemeContrastType = keyof ConsonantArticulatoryFeatures | keyof VowelArticulatoryFeatures;

export type PhonemeContrast = {
	phonemeIds: [PhonemeSymbolId, PhonemeSymbolId]; // The pair. e.g. ["voiced-bilabial-plosive", "voiced-labiodental-fricative"]
	contrastType: PhonemeArticulatoryFeatureKey[]; // Usually one, but can be multiple. e.g. ["manner", "place"]
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// TODO: Refine the contrasts for accuracy and completeness.
export const PhonemeContrastCatalog: PhonemeContrast[] = [
	// Consonants: Voicing
	{
		phonemeIds: ["voiceless-bilabial-plosive", "voiced-bilabial-plosive"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "pat", phonemic: "pæt" },
				{ word: "bat", phonemic: "bæt" },
			],
			[
				{ word: "rip", phonemic: "ɹɪp" },
				{ word: "rib", phonemic: "ɹɪb" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-alveolar-plosive", "voiced-alveolar-plosive"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "ten", phonemic: "tɛn" },
				{ word: "den", phonemic: "dɛn" },
			],
			[
				{ word: "seat", phonemic: "sit" },
				{ word: "seed", phonemic: "sid" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-velar-plosive", "voiced-velar-plosive"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "coat", phonemic: "koʊt" },
				{ word: "goat", phonemic: "goʊt" },
			],
			[
				{ word: "back", phonemic: "bæk" },
				{ word: "bag", phonemic: "bæɡ" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-labiodental-fricative", "voiced-labiodental-fricative"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "fan", phonemic: "fæn" },
				{ word: "van", phonemic: "væn" },
			],
			[
				{ word: "safe", phonemic: "seɪf" },
				{ word: "save", phonemic: "seɪv" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-alveolar-fricative", "voiced-alveolar-fricative"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "sip", phonemic: "sɪp" },
				{ word: "zip", phonemic: "zɪp" },
			],
			[
				{ word: "seal", phonemic: "sil" },
				{ word: "zeal", phonemic: "zil" },
			],
		],
	},

	// Consonants: Place/Manner
	{
		phonemeIds: ["voiceless-alveolar-fricative", "voiceless-postalveolar-fricative"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sip", phonemic: "sɪp" },
				{ word: "ship", phonemic: "ʃɪp" },
			],
			[
				{ word: "mess", phonemic: "mɛs" },
				{ word: "mesh", phonemic: "mɛʃ" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-postalveolar-affricate", "voiceless-postalveolar-fricative"],
		contrastType: ["manner"],
		minimalPairs: [
			[
				{ word: "cheap", phonemic: "tʃip" },
				{ word: "sheep", phonemic: "ʃip" },
			],
			[
				{ word: "chin", phonemic: "tʃɪn" },
				{ word: "shin", phonemic: "ʃɪn" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-postalveolar-affricate", "voiced-postalveolar-affricate"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "cheap", phonemic: "tʃip" },
				{ word: "jeep", phonemic: "dʒip" },
			],
			[
				{ word: "chin", phonemic: "tʃɪn" },
				{ word: "gin", phonemic: "dʒɪn" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-dental-fricative", "voiceless-alveolar-plosive"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "thin", phonemic: "θɪn" },
				{ word: "tin", phonemic: "tɪn" },
			],
			[
				{ word: "thank", phonemic: "θæŋk" },
				{ word: "tank", phonemic: "tæŋk" },
			],
		],
	},
	{
		phonemeIds: ["voiceless-dental-fricative", "voiceless-alveolar-fricative"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "thin", phonemic: "θɪn" },
				{ word: "sin", phonemic: "sɪn" },
			],
			[
				{ word: "think", phonemic: "θɪŋk" },
				{ word: "sink", phonemic: "sɪŋk" },
			],
		],
	},
	{
		phonemeIds: ["voiced-dental-fricative", "voiced-alveolar-plosive"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "they", phonemic: "ðeɪ" },
				{ word: "day", phonemic: "deɪ" },
			],
			[
				{ word: "though", phonemic: "ðoʊ" },
				{ word: "dough", phonemic: "doʊ" },
			],
		],
	},
	{
		phonemeIds: ["voiced-dental-fricative", "voiced-alveolar-fricative"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "breathe", phonemic: "bɹið" },
				{ word: "breeze", phonemic: "bɹiz" },
			],
			[
				{ word: "seethe", phonemic: "sið" },
				{ word: "seize", phonemic: "siz" },
			],
		],
	},
	{
		phonemeIds: ["voiced-alveolar-nasal", "voiced-velar-nasal"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "ban", phonemic: "bæn" },
				{ word: "bang", phonemic: "bæŋ" },
			],
			[
				{ word: "sun", phonemic: "sʌn" },
				{ word: "sung", phonemic: "sʌŋ" },
			],
		],
	},
	{
		phonemeIds: ["voiced-bilabial-nasal", "voiced-alveolar-nasal"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sum", phonemic: "sʌm" },
				{ word: "sun", phonemic: "sʌn" },
			],
			[
				{ word: "ram", phonemic: "ræm" },
				{ word: "ran", phonemic: "ræn" },
			],
		],
	},
	{
		phonemeIds: ["voiced-labial-velar-approximant", "voiced-labiodental-fricative"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "wine", phonemic: "waɪn" },
				{ word: "vine", phonemic: "vaɪn" },
			],
			[
				{ word: "west", phonemic: "wɛst" },
				{ word: "vest", phonemic: "vɛst" },
			],
		],
	},
	{
		phonemeIds: ["voiced-alveolar-lateral-approximant", "voiced-postalveolar-approximant"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "led", phonemic: "lɛd" },
				{ word: "red", phonemic: "ɹɛd" },
			],
			[
				{ word: "light", phonemic: "laɪt" },
				{ word: "right", phonemic: "ɹaɪt" },
			],
		],
	},
	{
		phonemeIds: ["voiced-palatal-approximant", "voiced-postalveolar-affricate"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "yoke", phonemic: "joʊk" },
				{ word: "joke", phonemic: "dʒoʊk" },
			],
			[
				{ word: "year", phonemic: "jɪɹ" },
				{ word: "jeer", phonemic: "dʒɪɹ" },
			],
		],
	},
	{
		phonemeIds: ["voiced-bilabial-plosive", "voiced-labiodental-fricative"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "best", phonemic: "bɛst" },
				{ word: "vest", phonemic: "vɛst" },
			],
		],
	},

	// Vowels: Height/Backness/Roundness/Tenseness ---
	{
		phonemeIds: ["close-front-unrounded", "near-close-near-front-unrounded"], // /i/ vs /ɪ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "beet", phonemic: "bit" },
				{ word: "bit", phonemic: "bɪt" },
			],
			[
				{ word: "seat", phonemic: "sit" },
				{ word: "sit", phonemic: "sɪt" },
			],
		],
	},
	{
		phonemeIds: ["close-back-rounded", "near-close-near-back-rounded"], // /u/ vs /ʊ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "pool", phonemic: "pul" },
				{ word: "pull", phonemic: "pʊl" },
			],
			[
				{ word: "Luke", phonemic: "luk" },
				{ word: "look", phonemic: "lʊk" },
			],
		],
	},
	{
		phonemeIds: ["open-mid-front-unrounded", "near-open-front-unrounded"], // /ɛ/ vs /æ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "bet", phonemic: "bɛt" },
				{ word: "bat", phonemic: "bæt" },
			],
			[
				{ word: "men", phonemic: "mɛn" },
				{ word: "man", phonemic: "mæn" },
			],
		],
	},
	{
		phonemeIds: ["near-close-near-back-rounded", "open-mid-back-unrounded"], // /ʊ/ vs /ʌ/
		contrastType: ["height", "roundness"],
		minimalPairs: [
			[
				{ word: "put", phonemic: "pʊt" },
				{ word: "putt", phonemic: "pʌt" },
			],
			[
				{ word: "book", phonemic: "bʊk" },
				{ word: "buck", phonemic: "bʌk" },
			],
		],
	},
	{
		phonemeIds: ["open-mid-back-unrounded", "open-back-unrounded"], // /ʌ/ vs /ɑ/
		contrastType: ["height", "backness"],
		minimalPairs: [
			[
				{ word: "cup", phonemic: "kʌp" },
				{ word: "cop", phonemic: "kɑp" },
			],
			[
				{ word: "luck", phonemic: "lʌk" },
				{ word: "lock", phonemic: "lɑk" },
			],
		],
	},

	// Diphthong vs Diphthong: Height cues
	{
		phonemeIds: [
			"open-front-unrounded-to-near-close-near-front-unrounded",
			"close-mid-front-unrounded-to-near-close-near-front-unrounded",
		], // /aɪ/ vs /eɪ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "time", phonemic: "taɪm" },
				{ word: "tame", phonemic: "teɪm" },
			],
			[
				{ word: "line", phonemic: "laɪn" },
				{ word: "lane", phonemic: "leɪn" },
			],
		],
	},
	{
		phonemeIds: [
			"close-mid-back-rounded-to-near-close-near-back-rounded",
			"open-front-unrounded-to-near-close-near-back-rounded",
		], // /oʊ/ vs /aʊ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "know", phonemic: "noʊ" },
				{ word: "now", phonemic: "naʊ" },
			],
			[
				{ word: "coat", phonemic: "koʊt" },
				{ word: "cow", phonemic: "kaʊ" },
			],
		],
	},
];

export type PhonemeContrastMatch = {
	partnerId: PhonemeSymbolId;
	contrastType: PhonemeContrastType[];
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// Scoped record generation using IIFE for O(1) access in consumption
export const ContrastsByPhonemeIdRegistry: Partial<
	Record<PhonemeSymbolId, PhonemeContrastMatch[]>
> = (() => {
	const record: Partial<Record<PhonemeSymbolId, PhonemeContrastMatch[]>> = {};

	for (const contrast of PhonemeContrastCatalog) {
		const [leftId, rightId] = contrast.phonemeIds;

		const addEntry = (fromId: PhonemeSymbolId, toId: PhonemeSymbolId) => {
			const entry: PhonemeContrastMatch = {
				partnerId: toId,
				contrastType: contrast.contrastType,
				minimalPairs: contrast.minimalPairs,
			};

			const existing = record[fromId];
			if (existing) {
				existing.push(entry);
			} else {
				record[fromId] = [entry];
			}
		};

		addEntry(leftId, rightId);
		addEntry(rightId, leftId);
	}

	return record;
})();
