import { cmudict } from "./cmudict";
import type { G2PRequest, G2PResponse, G2PWord } from "./schemas";

async function ensureDictLoaded(): Promise<void> {
	await cmudict.load();
}

function tokenizeText(text: string): string[] {
	return text
		.replace(/[^\w\s'-]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.map((word) => word.trim());
}

export async function transcribeText(request: G2PRequest): Promise<G2PResponse> {
	const { text } = request;

	try {
		// Validate input
		if (!text || text.trim().length === 0) {
			return { words: [] };
		}

		await ensureDictLoaded();

		const words = tokenizeText(text);
		const results: G2PWord[] = [];

		for (const word of words) {
			if (word.length === 0) continue; // Skip empty words

			const phonemes = cmudict.lookup(word);

			results.push({
				word: word.toLowerCase(),
				phonemes: phonemes || [],
			});
		}

		return { words: results };
	} catch (error) {
		console.error("G2P error:", error);
		throw new Error(`Failed to transcribe text: ${error}`);
	}
}

export function getServiceStats() {
	return {
		serviceName: "cmudict-g2p",
		isHealthy: true,
		description: "CMU Dictionary G2P service",
	};
}

export type { G2PWord, G2PResponse, G2PRequest };
