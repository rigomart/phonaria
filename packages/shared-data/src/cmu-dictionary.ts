// Sample CMU Dictionary data structure
// This is a simplified version for demonstration purposes
// In a real implementation, this would be a comprehensive dictionary

export interface CmuDictionaryEntry {
	word: string;
	phonemes: string;
}

// Sample entries with real IPA symbols from our phoneme data
export const cmuDictionary: CmuDictionaryEntry[] = [
	{ word: "hello", phonemes: "hɛˈloʊ" },
	{ word: "world", phonemes: "wɝˈld" },
	{ word: "phoneme", phonemes: "ˈfoʊniːm" },
	{ word: "english", phonemes: "ˈɪŋɡlɪʃ" },
	{ word: "pronunciation", phonemes: "prəˌnʌnsiˈeɪʃən" },
	{ word: "practice", phonemes: "ˈpræktɪs" },
	{ word: "learning", phonemes: "ˈlɝnɪŋ" },
	{ word: "sound", phonemes: "saʊnd" },
	{ word: "articulation", phonemes: "ɑrˌtɪkjuˈleɪʃən" },
	{ word: "vowel", phonemes: "ˈvaʊəl" },
	{ word: "consonant", phonemes: "ˈkɑnsənənt" },
	{ word: "ipa", phonemes: "ˌaɪpiˈeɪ" },
];

// Create a map for faster lookups
export const cmuDictionaryMap = new Map<string, string>(
	cmuDictionary.map((entry) => [entry.word.toLowerCase(), entry.phonemes]),
);
