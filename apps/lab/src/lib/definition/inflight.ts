import type { DefinitionLookupOutput } from "./contract";
import { normalizeDefinitionWord } from "./normalize";

const inflightByWord = new Map<string, Promise<DefinitionLookupOutput>>();

/**
 * Share one in-flight request per normalized word. Completed results are not
 * cached — a later open of the same popover fetches again.
 */
export function lookupDefinitionDeduped(
	word: string,
	lookup: (word: string) => Promise<DefinitionLookupOutput>,
): Promise<DefinitionLookupOutput> {
	const key = normalizeDefinitionWord(word) || word;
	const existing = inflightByWord.get(key);
	if (existing) return existing;

	const request = lookup(key).finally(() => {
		inflightByWord.delete(key);
	});
	inflightByWord.set(key, request);
	return request;
}

export function resetDefinitionInflightForTests(): void {
	inflightByWord.clear();
}
