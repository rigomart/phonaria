import OpenAI from "openai";
import type { G2PWord } from "../types/g2p";

/**
 * OpenAI service for G2P (Grapheme-to-Phoneme) conversion
 */
export class OpenAIService {
	private client: OpenAI;

	constructor(apiKey: string) {
		this.client = new OpenAI({ apiKey });
	}

	/**
	 * Convert text to phonemic transcription using OpenAI GPT-4o-mini
	 */
	async textToPhonemes(text: string): Promise<G2PWord[]> {
		const prompt = this.createG2PPrompt(text);

		try {
			const response = await this.client.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "system",
						content: `You are a phonetics expert specializing in American English pronunciation. Convert input text to phonemic transcription using standard IPA symbols. Always respond with valid JSON only.`,
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.1,
				max_tokens: 1000,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error("No response from OpenAI");
			}

			return this.parseOpenAIResponse(content);
		} catch (error) {
			console.error("OpenAI API error:", error);
			throw new Error(
				`Failed to convert text to phonemes: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Create a focused prompt for G2P conversion
	 */
	private createG2PPrompt(text: string): string {
		return `Convert the following text to phonemic transcription using standard American English IPA symbols:

Input text: "${text}"

Requirements:
1. Split the text into individual words
2. For each word, provide an array of individual phonemes (IPA symbols)
3. Use standard American English pronunciation
4. Return JSON format: {"words": [{"word": "example", "phonemes": ["ɪ", "ɡ", "ˈz", "æ", "m", "p", "əl"]}]}
5. Include stress markers (ˈ for primary stress, ˌ for secondary stress) where appropriate
6. Handle common contractions and abbreviations appropriately

Only respond with the JSON object, no additional text or formatting.`;
	}

	/**
	 * Parse and validate OpenAI response
	 */
	private parseOpenAIResponse(content: string): G2PWord[] {
		try {
			// Clean up response - remove any markdown formatting or extra whitespace
			const cleanContent = content.trim().replace(/```json\n?|\n?```/g, "");

			const parsed = JSON.parse(cleanContent);

			if (!parsed.words || !Array.isArray(parsed.words)) {
				throw new Error("Invalid response format: missing words array");
			}

			// Validate each word object
			for (const word of parsed.words) {
				if (!word.word || typeof word.word !== "string") {
					throw new Error("Invalid word format: missing or invalid word field");
				}
				if (!word.phonemes || !Array.isArray(word.phonemes)) {
					throw new Error("Invalid word format: missing or invalid phonemes array");
				}
				// Ensure all phonemes are strings
				for (const phoneme of word.phonemes) {
					if (typeof phoneme !== "string") {
						throw new Error("Invalid phoneme format: all phonemes must be strings");
					}
				}
			}

			return parsed.words;
		} catch (error) {
			console.error("Failed to parse OpenAI response:", content);
			throw new Error(
				`Invalid response from OpenAI: ${error instanceof Error ? error.message : "JSON parse error"}`,
			);
		}
	}
}
