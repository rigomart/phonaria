import type { ConsonantPhoneme } from "./types";

export const consonants: ConsonantPhoneme[] = [
	{
		symbol: "p",
		category: "consonant",
		type: "stop",
		articulation: {
			place: "bilabial",
			manner: "stop",
			voicing: "voiceless",
		},
		examples: [
			{ word: "please", phonemic: "pliz" },
			{ word: "help", phonemic: "hɛlp" },
		],
		description: "voiceless bilabial stop",
		guide: "Lips together, release air without voice.",
	},
	{
		symbol: "b",
		category: "consonant",
		type: "stop",
		articulation: {
			place: "bilabial",
			manner: "stop",
			voicing: "voiced",
		},
		examples: [
			{ word: "buy", phonemic: "baɪ" },
			{ word: "maybe", phonemic: "ˈmeɪbi" },
		],
		description: "voiced bilabial stop",
		guide: "Lips together, release air with vocal cord vibration.",
	},
	{
		symbol: "t",
		category: "consonant",
		type: "stop",
		articulation: {
			place: "alveolar",
			manner: "stop",
			voicing: "voiceless",
		},
		examples: [
			{ word: "time", phonemic: "taɪm" },
			{ word: "eat", phonemic: "it" },
		],
		description: "voiceless alveolar stop",
		guide: "Tongue taps roof of mouth behind teeth, release air.",
		allophones: [
			{
				variant: "ɾ",
				description: "Flapped between vowels in casual speech.",
				examples: [{ word: "butter", phonemic: "bʌɾɚ" }],
				context: "Intervocalic position in casual American English",
			},
			{
				variant: "ʔ",
				description: "Glottal stop in informal words.",
				examples: [{ word: "button", phonemic: "bʌʔn̩" }],
				context: "Before syllabic /n/ in informal speech",
			},
		],
	},
	{
		symbol: "d",
		category: "consonant",
		type: "stop",
		articulation: {
			place: "alveolar",
			manner: "stop",
			voicing: "voiced",
		},
		examples: [
			{ word: "day", phonemic: "deɪ" },
			{ word: "good", phonemic: "ɡʊd" },
		],
		allophones: [
			{
				variant: "ɾ",
				description: "Flapped between vowels in casual speech.",
				examples: [{ word: "ladder", phonemic: "ˈlæɾɚ" }],
				context: "Intervocalic position in casual American English",
			},
		],
		description: "voiced alveolar stop",
		guide: "Tongue taps roof of mouth behind teeth, release air with vibration.",
	},
	{
		symbol: "k",
		category: "consonant",
		type: "stop",
		articulation: {
			place: "velar",
			manner: "stop",
			voicing: "voiceless",
		},
		examples: [
			{ word: "come", phonemic: "kʌm" },
			{ word: "work", phonemic: "wɝk" },
		],
		description: "voiceless velar stop",
		guide: "Back of tongue against soft palate, release air without voice.",
	},
	{
		symbol: "ɡ",
		category: "consonant",
		type: "stop",
		articulation: {
			place: "velar",
			manner: "stop",
			voicing: "voiced",
		},
		examples: [
			{ word: "get", phonemic: "ɡɛt" },
			{ word: "big", phonemic: "bɪɡ" },
		],
		description: "voiced velar stop",
		guide: "Back of tongue against soft palate, release air with vibration.",
	},
	{
		symbol: "ʃ",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "postalveolar",
			manner: "fricative",
			voicing: "voiceless",
		},
		examples: [
			{ word: "sure", phonemic: "ʃʊɹ" },
			{ word: "finish", phonemic: "ˈfɪnɪʃ" },
		],
		description: "voiceless postalveolar fricative",
		guide: "Tongue near palate, blow air without voice.",
	},
	{
		symbol: "tʃ",
		category: "consonant",
		type: "affricate",
		articulation: {
			place: "postalveolar",
			manner: "affricate",
			voicing: "voiceless",
		},
		examples: [
			{ word: "check", phonemic: "tʃɛk" },
			{ word: "watch", phonemic: "wɑtʃ" },
		],
		description: "voiceless postalveolar affricate",
		guide: "Tongue near palate, release to friction without voice.",
	},
	{
		symbol: "ʒ",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "postalveolar",
			manner: "fricative",
			voicing: "voiced",
		},
		examples: [
			{ word: "measure", phonemic: "ˈmɛʒɚ" },
			{ word: "television", phonemic: "ˈtɛləˌvɪʒən" },
		],
		description: "voiced postalveolar fricative",
		guide: "Tongue near palate, blow air with vibration.",
	},
	{
		symbol: "dʒ",
		category: "consonant",
		type: "affricate",
		articulation: {
			place: "postalveolar",
			manner: "affricate",
			voicing: "voiced",
		},
		examples: [
			{ word: "just", phonemic: "dʒʌst" },
			{ word: "change", phonemic: "tʃeɪndʒ" },
		],
		description: "voiced postalveolar affricate",
		guide: "Tongue near palate, release to friction with vibration.",
	},
	{
		symbol: "f",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "labiodental",
			manner: "fricative",
			voicing: "voiceless",
		},
		examples: [
			{ word: "find", phonemic: "faɪnd" },
			{ word: "if", phonemic: "ɪf" },
		],
		description: "voiceless labiodental fricative",
		guide: "Lower lip against upper teeth, blow air without voice.",
	},
	{
		symbol: "v",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "labiodental",
			manner: "fricative",
			voicing: "voiced",
		},
		examples: [
			{ word: "very", phonemic: "ˈvɛri" },
			{ word: "have", phonemic: "hæv" },
		],
		description: "voiced labiodental fricative",
		guide: "Lower lip against upper teeth, blow air with vibration.",
	},
	{
		symbol: "θ",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "dental",
			manner: "fricative",
			voicing: "voiceless",
		},
		examples: [
			{ word: "think", phonemic: "θɪŋk" },
			{ word: "month", phonemic: "mʌnθ" },
		],
		description: "voiceless dental fricative",
		guide: "Tongue between teeth, blow air without voice.",
	},
	{
		symbol: "ð",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "dental",
			manner: "fricative",
			voicing: "voiced",
		},
		examples: [
			{ word: "the", phonemic: "ðə" },
			{ word: "with", phonemic: "wɪð" },
		],
		description: "voiced dental fricative",
		guide: "Tongue between teeth, blow air with vibration.",
	},
	{
		symbol: "s",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "alveolar",
			manner: "fricative",
			voicing: "voiceless",
		},
		examples: [
			{ word: "see", phonemic: "si" },
			{ word: "yes", phonemic: "jɛs" },
		],
		description: "voiceless alveolar fricative",
		guide: "Tongue near alveolar ridge, blow air without voice.",
	},
	{
		symbol: "z",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "alveolar",
			manner: "fricative",
			voicing: "voiced",
		},
		examples: [
			{ word: "zero", phonemic: "ˈzɪɹoʊ" },
			{ word: "easy", phonemic: "ˈizi" },
		],
		description: "voiced alveolar fricative",
		guide: "Tongue near alveolar ridge, blow air with vibration.",
	},
	{
		symbol: "h",
		category: "consonant",
		type: "fricative",
		articulation: {
			place: "glottal",
			manner: "fricative",
			voicing: "voiceless",
		},
		examples: [
			{ word: "how", phonemic: "haʊ" },
			{ word: "here", phonemic: "hɪɹ" },
		],
		description: "voiceless glottal fricative",
		guide: "Air through open vocal cords without voice.",
	},
	{
		symbol: "m",
		category: "consonant",
		type: "nasal",
		articulation: {
			place: "bilabial",
			manner: "nasal",
			voicing: "voiced",
		},
		examples: [
			{ word: "make", phonemic: "meɪk" },
			{ word: "some", phonemic: "sʌm" },
		],
		description: "voiced bilabial nasal",
		guide: "Lips together, air through nose with vibration.",
	},
	{
		symbol: "n",
		category: "consonant",
		type: "nasal",
		articulation: {
			place: "alveolar",
			manner: "nasal",
			voicing: "voiced",
		},
		examples: [
			{ word: "now", phonemic: "naʊ" },
			{ word: "can", phonemic: "kæn" },
		],
		description: "voiced alveolar nasal",
		guide: "Tongue on alveolar ridge, air through nose with vibration.",
	},
	{
		symbol: "ŋ",
		category: "consonant",
		type: "nasal",
		articulation: {
			place: "velar",
			manner: "nasal",
			voicing: "voiced",
		},
		examples: [
			{ word: "long", phonemic: "lɔŋ" },
			{ word: "thing", phonemic: "θɪŋ" },
		],
		description: "voiced velar nasal",
		guide: "Back of tongue against soft palate, air through nose with vibration.",
	},
	{
		symbol: "l",
		category: "consonant",
		type: "liquid",
		articulation: {
			place: "alveolar",
			manner: "liquid",
			voicing: "voiced",
		},
		examples: [
			{ word: "like", phonemic: "laɪk" },
			{ word: "will", phonemic: "wɪl" },
		],
		description: "voiced alveolar lateral liquid",
		guide: "Tongue tip touches alveolar ridge, air flows around the sides.",
		allophones: [
			{
				variant: "ɫ",
				description: "Dark L (velarized) at syllable ends.",
				examples: [{ word: "ball", phonemic: "bɔɫ" }],
				context: "Syllable-final position (coda)",
			},
		],
	},
	{
		symbol: "ɹ",
		category: "consonant",
		type: "liquid",
		articulation: {
			place: "postalveolar",
			manner: "liquid",
			voicing: "voiced",
		},
		examples: [
			{ word: "right", phonemic: "ɹaɪt" },
			{ word: "are", phonemic: "ɑɹ" },
		],
		description: "voiced postalveolar liquid",
		guide: "Tongue tip curled back or bunched, not touching the roof of mouth.",
	},
	{
		symbol: "j",
		category: "consonant",
		type: "glide",
		articulation: {
			place: "palatal",
			manner: "glide",
			voicing: "voiced",
		},
		examples: [
			{ word: "year", phonemic: "jɪɹ" },
			{ word: "you", phonemic: "ju" },
		],
		description: "voiced palatal approximant",
		guide: "Tongue near hard palate, like a quick 'ee' sound with vibration.",
	},
	{
		symbol: "w",
		category: "consonant",
		type: "glide",
		articulation: {
			place: "velar",
			manner: "glide",
			voicing: "voiced",
		},
		examples: [
			{ word: "want", phonemic: "wɑnt" },
			{ word: "one", phonemic: "wʌn" },
		],
		description: "voiced labial-velar approximant",
		guide: "Lips rounded while back of tongue approaches soft palate, like starting to say 'oo'.",
	},
];
