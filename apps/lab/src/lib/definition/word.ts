import { MAX_DEFINITION_WORD_LENGTH } from "./contract";

const SURROUNDING_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const ALLOWED_LOOKUP_WORD = /^[\p{L}\p{N}'-]+$/u;

export function normalizeDefinitionWord(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replace(/[\u2018\u2019]/g, "'")
		.replace(/[\u2010-\u2015]/g, "-")
		.replace(SURROUNDING_PUNCTUATION, "");
}

export function isLookupableDefinitionWord(word: string): boolean {
	return (
		word.length > 0 && word.length <= MAX_DEFINITION_WORD_LENGTH && ALLOWED_LOOKUP_WORD.test(word)
	);
}
