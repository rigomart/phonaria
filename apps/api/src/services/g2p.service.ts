import { cmudict } from "../lib/cmudict";
import type { G2PResponse, G2PWord } from "../schemas/g2p.schema";

export interface G2PRequest {
	text: string;
}

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
		await ensureDictLoaded();

		const words = tokenizeText(text);
		const results: G2PWord[] = [];

		for (const word of words) {
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

export type { G2PWord, G2PResponse };
