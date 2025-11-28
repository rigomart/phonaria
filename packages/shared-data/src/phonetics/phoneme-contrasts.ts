import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
} from "./ipa-registry";

export type PhonemeContrastPair = {
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
		],
	},
	{
		phonemeIds: ["voiceless-alveolar-plosive", "voiced-alveolar-plosive"],
		contrastType: ["voicing"],
		minimalPairs: [
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
		],
	},
	{
		phonemeIds: ["voiced-alveolar-nasal", "voiced-velar-nasal"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sin", phonemic: "sɪn" },
				{ word: "sing", phonemic: "sɪŋ" },
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
				{ word: "food", phonemic: "fud" },
				{ word: "foot", phonemic: "fʊt" },
			],
		],
	},
	{
		phonemeIds: ["open-mid-front-unrounded", "near-open-front-unrounded"], // /ɛ/ vs /æ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "bed", phonemic: "bɛd" },
				{ word: "bad", phonemic: "bæd" },
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
