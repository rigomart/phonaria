/**
 * Phonetic Result types
 */

export interface PhoneticResult {
	word: string;
	phonemes: string[];
	source: "dictionary" | "rule" | "llm" | "fallback";
	confidence: number;
	rawIpa?: string;
}
