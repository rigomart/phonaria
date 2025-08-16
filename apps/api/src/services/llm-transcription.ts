import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { cmuDictionaryMap, getRuleBasedPhonemes } from "shared-data";
import { z } from "zod";

// Zod schema for LLM response
const LLMResponseSchema = z.object({
	transcription: z.string(),
	confidence: z.number().min(0).max(1),
	method: z.enum(["llm", "dictionary", "rules"]),
});

type LLMResponse = z.infer<typeof LLMResponseSchema>;

// System prompt for the LLM
const SYSTEM_PROMPT = `You are an expert in English phonetics and the International Phonetic Alphabet (IPA). 
Your task is to convert English text into accurate IPA phonemic transcription.

Guidelines:
1. Use only IPA symbols from the standard English phoneme set
2. Use primary stress marks (ˈ) and secondary stress marks (ˌ) where appropriate
3. Use syllable boundaries (.) only when specifically requested
4. Do not include any explanations or additional text, only the transcription
5. For multi-word input, transcribe each word separately and join with spaces
6. Focus on General American English pronunciation

Example input: "hello world"
Example output: "hɛˈloʊ wɝˈld"

Example input: "pronunciation"
Example output: "prəˌnʌnsiˈeɪʃən"

Use only standard IPA symbols. Do not use made-up or non-standard symbols.`;

// Function to transcribe using Anthropic Claude
async function transcribeWithAnthropic(
	text: string,
	anthropicApiKey: string,
): Promise<LLMResponse | null> {
	try {
		const anthropic = new Anthropic({
			apiKey: anthropicApiKey,
		});

		const response = await anthropic.messages.create({
			model: "claude-3-5-sonnet-20240620",
			max_tokens: 1000,
			system: SYSTEM_PROMPT,
			messages: [
				{
					role: "user",
					content: `Transcribe the following English text into IPA: "${text}"`,
				},
			],
		});

		const content = response.content[0];
		if (content.type !== "text") {
			throw new Error("Unexpected response format from Anthropic");
		}

		return {
			transcription: content.text.trim(),
			confidence: 0.9,
			method: "llm",
		};
	} catch (error) {
		console.error("Error transcribing with Anthropic:", error);
		return null;
	}
}

// Function to transcribe using OpenAI GPT
async function transcribeWithOpenAI(
	text: string,
	openaiApiKey: string,
): Promise<LLMResponse | null> {
	try {
		const openai = new OpenAI({
			apiKey: openaiApiKey,
		});

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: SYSTEM_PROMPT,
				},
				{
					role: "user",
					content: `Transcribe the following English text into IPA: "${text}"`,
				},
			],
			temperature: 0,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("Unexpected response format from OpenAI");
		}

		return {
			transcription: content.trim(),
			confidence: 0.85,
			method: "llm",
		};
	} catch (error) {
		console.error("Error transcribing with OpenAI:", error);
		return null;
	}
}

// Function to transcribe using CMU dictionary
function transcribeWithDictionary(text: string): LLMResponse | null {
	const words = text.toLowerCase().split(/\s+/);
	const transcriptions: string[] = [];

	for (const word of words) {
		// Remove punctuation for lookup
		const cleanWord = word.replace(/[^\w]/g, "");
		const phonemes = cmuDictionaryMap.get(cleanWord);

		if (phonemes) {
			transcriptions.push(phonemes);
		} else {
			// If any word is not found, fall back to the next method
			return null;
		}
	}

	return {
		transcription: transcriptions.join(" "),
		confidence: 0.95,
		method: "dictionary",
	};
}

// Function to transcribe using rule-based mapping
function transcribeWithRules(text: string): LLMResponse {
	const words = text.toLowerCase().split(/\s+/);
	const transcriptions: string[] = [];

	for (const word of words) {
		// Remove punctuation for lookup
		const cleanWord = word.replace(/[^\w]/g, "");
		const { phonemes } = getRuleBasedPhonemes(cleanWord);
		transcriptions.push(phonemes);
	}

	return {
		transcription: transcriptions.join(" "),
		confidence: 0.3,
		method: "rules",
	};
}

// Main transcription function with fallback logic
export async function transcribeText(
	text: string,
	env: { ANTHROPIC_API_KEY?: string; OPENAI_API_KEY?: string },
): Promise<LLMResponse> {
	// Layer 1: Try LLM (Anthropic first, then OpenAI)
	if (env.ANTHROPIC_API_KEY) {
		const result = await transcribeWithAnthropic(text, env.ANTHROPIC_API_KEY);
		if (result) return result;
	}

	if (env.OPENAI_API_KEY) {
		const result = await transcribeWithOpenAI(text, env.OPENAI_API_KEY);
		if (result) return result;
	}

	// Layer 2: Try CMU Dictionary
	const dictResult = transcribeWithDictionary(text);
	if (dictResult) return dictResult;

	// Layer 3: Rule-based mapping (fallback)
	return transcribeWithRules(text);
}
