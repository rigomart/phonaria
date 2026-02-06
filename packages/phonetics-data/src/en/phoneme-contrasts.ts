import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	VowelArticulatoryFeatures,
} from "../core/articulatory-features";
import type {
	EnglishPhonemeSymbolId,
	LanguagePhonemeId,
} from "../core/language-phoneme-inventories";
import type { TargetLanguage } from "../core/types";

export type PhonemeContrastPair = {
	word: string;
	phonemic: string;
};

type PhonemeContrastType = keyof ConsonantArticulatoryFeatures | keyof VowelArticulatoryFeatures;

export type PhonemeContrast = {
	phonemeIds: [EnglishPhonemeSymbolId, EnglishPhonemeSymbolId]; // The pair. e.g. ["B", "V"]
	contrastType: PhonemeArticulatoryFeatureKey[]; // Usually one, but can be multiple. e.g. ["manner", "place"]
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// TODO: Refine the contrasts for accuracy and completeness.
export const PhonemeContrastCatalog: PhonemeContrast[] = [
	// Consonants: Voicing
	{
		phonemeIds: ["P", "B"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "pat", phonemic: "pæt" },
				{ word: "bat", phonemic: "bæt" },
			],
		],
	},
	{
		phonemeIds: ["T", "D"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "seat", phonemic: "sit" },
				{ word: "seed", phonemic: "sid" },
			],
		],
	},
	{
		phonemeIds: ["K", "G"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "coat", phonemic: "koʊt" },
				{ word: "goat", phonemic: "goʊt" },
			],
		],
	},
	{
		phonemeIds: ["F", "V"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "fan", phonemic: "fæn" },
				{ word: "van", phonemic: "væn" },
			],
		],
	},
	{
		phonemeIds: ["S", "Z"],
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
		phonemeIds: ["S", "SH"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sip", phonemic: "sɪp" },
				{ word: "ship", phonemic: "ʃɪp" },
			],
		],
	},
	{
		phonemeIds: ["CH", "SH"],
		contrastType: ["manner"],
		minimalPairs: [
			[
				{ word: "cheap", phonemic: "tʃip" },
				{ word: "sheep", phonemic: "ʃip" },
			],
		],
	},
	{
		phonemeIds: ["CH", "J"],
		contrastType: ["voicing"],
		minimalPairs: [
			[
				{ word: "cheap", phonemic: "tʃip" },
				{ word: "jeep", phonemic: "dʒip" },
			],
		],
	},
	{
		phonemeIds: ["TH", "T"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "thin", phonemic: "θɪn" },
				{ word: "tin", phonemic: "tɪn" },
			],
		],
	},
	{
		phonemeIds: ["TH", "S"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "thin", phonemic: "θɪn" },
				{ word: "sin", phonemic: "sɪn" },
			],
		],
	},
	{
		phonemeIds: ["DH", "D"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "they", phonemic: "ðeɪ" },
				{ word: "day", phonemic: "deɪ" },
			],
		],
	},
	{
		phonemeIds: ["DH", "Z"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "breathe", phonemic: "bɹið" },
				{ word: "breeze", phonemic: "bɹiz" },
			],
		],
	},
	{
		phonemeIds: ["N", "NG"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sin", phonemic: "sɪn" },
				{ word: "sing", phonemic: "sɪŋ" },
			],
		],
	},
	{
		phonemeIds: ["M", "N"],
		contrastType: ["place"],
		minimalPairs: [
			[
				{ word: "sum", phonemic: "sʌm" },
				{ word: "sun", phonemic: "sʌn" },
			],
		],
	},
	{
		phonemeIds: ["W", "V"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "wine", phonemic: "waɪn" },
				{ word: "vine", phonemic: "vaɪn" },
			],
		],
	},
	{
		phonemeIds: ["L", "R"],
		contrastType: ["place", "manner"],
		minimalPairs: [
			[
				{ word: "led", phonemic: "lɛd" },
				{ word: "red", phonemic: "ɹɛd" },
			],
		],
	},
	{
		phonemeIds: ["Y", "J"],
		contrastType: ["manner", "place"],
		minimalPairs: [
			[
				{ word: "yoke", phonemic: "joʊk" },
				{ word: "joke", phonemic: "dʒoʊk" },
			],
		],
	},
	{
		phonemeIds: ["B", "V"],
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
		phonemeIds: ["I", "IX"], // /i/ vs /ɪ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "seat", phonemic: "sit" },
				{ word: "sit", phonemic: "sɪt" },
			],
		],
	},
	{
		phonemeIds: ["U", "UX"], // /u/ vs /ʊ/
		contrastType: ["tenseness", "height"],
		minimalPairs: [
			[
				{ word: "food", phonemic: "fud" },
				{ word: "foot", phonemic: "fʊt" },
			],
		],
	},
	{
		phonemeIds: ["E", "AE"], // /ɛ/ vs /æ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "bed", phonemic: "bɛd" },
				{ word: "bad", phonemic: "bæd" },
			],
		],
	},
	{
		phonemeIds: ["UX", "AH"], // /ʊ/ vs /ʌ/
		contrastType: ["height", "roundness"],
		minimalPairs: [
			[
				{ word: "put", phonemic: "pʊt" },
				{ word: "putt", phonemic: "pʌt" },
			],
		],
	},
	{
		phonemeIds: ["AH", "A"], // /ʌ/ vs /ɑ/
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
		phonemeIds: ["AI", "EI"], // /aɪ/ vs /eɪ/
		contrastType: ["height"],
		minimalPairs: [
			[
				{ word: "time", phonemic: "taɪm" },
				{ word: "tame", phonemic: "teɪm" },
			],
		],
	},
	{
		phonemeIds: ["OU", "AU"], // /oʊ/ vs /aʊ/
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
	partnerId: EnglishPhonemeSymbolId;
	contrastType: PhonemeContrastType[];
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// Scoped record generation using IIFE for O(1) access in consumption
export const EnglishContrastsByPhonemeIdRegistry: Partial<
	Record<EnglishPhonemeSymbolId, PhonemeContrastMatch[]>
> = (() => {
	const record: Partial<Record<EnglishPhonemeSymbolId, PhonemeContrastMatch[]>> = {};

	for (const contrast of PhonemeContrastCatalog) {
		const [leftId, rightId] = contrast.phonemeIds;

		const addEntry = (fromId: EnglishPhonemeSymbolId, toId: EnglishPhonemeSymbolId) => {
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

export type LanguagePhonemeContrastRegistry<TLanguage extends TargetLanguage = TargetLanguage> =
	TLanguage extends "en"
		? Partial<Record<LanguagePhonemeId<"en">, PhonemeContrastMatch[]>>
		: Partial<Record<LanguagePhonemeId<TLanguage>, never>>;
