export type MinimalPair = {
	contrast: string; // e.g., "/ɪ/ vs /i/"
	category: "vowel" | "consonant";
	a: { word: string; phonemic: string };
	b: { word: string; phonemic: string };
	note?: string;
};

export const MINIMAL_PAIRS: MinimalPair[] = [
	{
		contrast: "/ɪ/ vs /i/",
		category: "vowel",
		a: { word: "ship", phonemic: "ʃɪp" },
		b: { word: "sheep", phonemic: "ʃip" },
		note: "Common contrast for many learners; length and quality differ.",
	},
	{
		contrast: "/ɛ/ vs /æ/",
		category: "vowel",
		a: { word: "bed", phonemic: "bɛd" },
		b: { word: "bad", phonemic: "bæd" },
	},
	{
		contrast: "/θ/ vs /s/",
		category: "consonant",
		a: { word: "think", phonemic: "θɪŋk" },
		b: { word: "sink", phonemic: "sɪŋk" },
		note: "Languages without dental fricatives often substitute /s/.",
	},
	{
		contrast: "/ɹ/ vs /l/",
		category: "consonant",
		a: { word: "rice", phonemic: "ɹaɪs" },
		b: { word: "lice", phonemic: "laɪs" },
	},
	{
		contrast: "/ʊ/ vs /u/",
		category: "vowel",
		a: { word: "could", phonemic: "kʊd" },
		b: { word: "cooed", phonemic: "kud" },
	},
	{
		contrast: "/p/ vs /b/",
		category: "consonant",
		a: { word: "pat", phonemic: "pæt" },
		b: { word: "bat", phonemic: "bæt" },
	},
];

