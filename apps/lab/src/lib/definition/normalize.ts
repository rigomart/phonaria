import {
	type DefinitionSenseGroup,
	MAX_DEFINITION_WORD_LENGTH,
	MAX_SENSES_PER_POS,
	MAX_SENSES_TOTAL,
} from "./contract";

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

export type DictionaryApiDefinition = {
	definition?: unknown;
};

export type DictionaryApiMeaning = {
	partOfSpeech?: unknown;
	definitions?: unknown;
};

export type DictionaryApiEntry = {
	word?: unknown;
	meanings?: unknown;
};

function asTrimmedString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function sensesFromMeaning(meaning: DictionaryApiMeaning): string[] {
	if (!Array.isArray(meaning.definitions)) return [];

	const senses: string[] = [];
	for (const item of meaning.definitions) {
		if (senses.length >= MAX_SENSES_PER_POS) break;
		if (!item || typeof item !== "object") continue;
		const definition = asTrimmedString((item as DictionaryApiDefinition).definition);
		if (definition) senses.push(definition);
	}
	return senses;
}

/**
 * Group senses by part of speech, keep the first two per POS, and stop at six
 * senses total. Later POS groups are dropped once the cap is reached.
 */
export function capDefinitionSenses(entries: DictionaryApiEntry[]): DefinitionSenseGroup[] {
	const byPos = new Map<string, string[]>();
	const order: string[] = [];

	for (const entry of entries) {
		if (!Array.isArray(entry.meanings)) continue;
		for (const meaning of entry.meanings) {
			if (!meaning || typeof meaning !== "object") continue;
			const partOfSpeech = asTrimmedString(meaning.partOfSpeech) ?? "unknown";
			if (!byPos.has(partOfSpeech)) {
				byPos.set(partOfSpeech, []);
				order.push(partOfSpeech);
			}
			const bucket = byPos.get(partOfSpeech);
			if (!bucket || bucket.length >= MAX_SENSES_PER_POS) continue;
			const nextSenses = sensesFromMeaning(meaning);
			for (const sense of nextSenses) {
				if (bucket.length >= MAX_SENSES_PER_POS) break;
				bucket.push(sense);
			}
		}
	}

	const groups: DefinitionSenseGroup[] = [];
	let remaining = MAX_SENSES_TOTAL;
	for (const partOfSpeech of order) {
		if (remaining <= 0) break;
		const senses = (byPos.get(partOfSpeech) ?? []).slice(0, remaining);
		if (senses.length === 0) continue;
		groups.push({ partOfSpeech, senses });
		remaining -= senses.length;
	}
	return groups;
}

export function firstDefinedWord(entries: DictionaryApiEntry[], fallback: string): string {
	for (const entry of entries) {
		const word = asTrimmedString(entry.word);
		if (word) return word;
	}
	return fallback;
}
