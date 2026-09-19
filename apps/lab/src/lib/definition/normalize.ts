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

export type WiktionaryMeaning = {
	partOfSpeech: string;
	definitions: string[];
};

function asTrimmedString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function stripDefinitionHtml(html: string): string {
	const withoutTags = html
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<\/(?:p|div|li|dd|dt)>/gi, " ")
		.replace(/<[^>]+>/g, "");
	return decodeBasicEntities(withoutTags).replace(/\s+/g, " ").trim();
}

function decodeBasicEntities(value: string): string {
	return value
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => codePointToChar(Number.parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, n: string) => codePointToChar(Number(n)));
}

function codePointToChar(codePoint: number): string {
	if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return "";
	return String.fromCodePoint(codePoint);
}

/**
 * Wiktionary REST definitions are language-keyed. v1 uses English (`en`) only.
 * Glosses often wrap links and labels in HTML — strip to plain text first.
 */
export function parseWiktionaryPayload(payload: unknown): WiktionaryMeaning[] {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
	const english = (payload as Record<string, unknown>).en;
	if (!Array.isArray(english)) return [];

	const meanings: WiktionaryMeaning[] = [];
	for (const item of english) {
		if (!item || typeof item !== "object") continue;
		const record = item as Record<string, unknown>;
		const partOfSpeech = asTrimmedString(record.partOfSpeech) ?? "unknown";
		const definitions: string[] = [];
		if (Array.isArray(record.definitions)) {
			for (const entry of record.definitions) {
				if (!entry || typeof entry !== "object") continue;
				const raw = asTrimmedString((entry as Record<string, unknown>).definition);
				if (!raw) continue;
				const plain = stripDefinitionHtml(raw);
				if (plain) definitions.push(plain);
			}
		}
		if (definitions.length > 0) {
			meanings.push({ partOfSpeech, definitions });
		}
	}
	return meanings;
}

/**
 * Group senses by part of speech, keep the first two per POS, and stop at six
 * senses total. Later POS groups are dropped once the cap is reached.
 */
export function capDefinitionSenses(meanings: WiktionaryMeaning[]): DefinitionSenseGroup[] {
	const byPos = new Map<string, string[]>();
	const order: string[] = [];

	for (const meaning of meanings) {
		const partOfSpeech = meaning.partOfSpeech.trim() || "unknown";
		if (!byPos.has(partOfSpeech)) {
			byPos.set(partOfSpeech, []);
			order.push(partOfSpeech);
		}
		const bucket = byPos.get(partOfSpeech);
		if (!bucket || bucket.length >= MAX_SENSES_PER_POS) continue;
		for (const definition of meaning.definitions) {
			if (bucket.length >= MAX_SENSES_PER_POS) break;
			const sense = definition.trim();
			if (sense) bucket.push(sense);
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
