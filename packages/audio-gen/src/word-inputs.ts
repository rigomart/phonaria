import type { TtsInput } from "./providers/types";
import { collectWordsWithPhonemic } from "./words";

export function getWordInputs(limit?: number): TtsInput[] {
	const words = collectWordsWithPhonemic();
	const selected = limit ? words.slice(0, limit) : words;

	return selected.map(({ word }) => ({
		id: word,
		text: word,
	}));
}
