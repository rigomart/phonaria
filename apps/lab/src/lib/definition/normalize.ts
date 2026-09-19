import {
	type DefinitionSense,
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

export type WiktionarySense = {
	definition: string;
	example?: string;
};

export type WiktionaryMeaning = {
	partOfSpeech: string;
	definitions: WiktionarySense[];
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

function plainDefinitionText(value: unknown): string | null {
	const raw = asTrimmedString(value);
	if (!raw) return null;
	const plain = stripDefinitionHtml(raw);
	return plain.length > 0 ? plain : null;
}

/**
 * Prefer the first usable `parsedExamples[].example`, then `examples[]`.
 * At most one example is kept per sense.
 */
function firstDefinitionExample(entry: Record<string, unknown>): string | undefined {
	if (Array.isArray(entry.parsedExamples)) {
		for (const item of entry.parsedExamples) {
			if (!item || typeof item !== "object") continue;
			const example = plainDefinitionText((item as Record<string, unknown>).example);
			if (example) return example;
		}
	}
	if (Array.isArray(entry.examples)) {
		for (const item of entry.examples) {
			const example = plainDefinitionText(item);
			if (example) return example;
		}
	}
	return undefined;
}

function toSense(definition: string, example?: string): DefinitionSense {
	return example ? { definition, example } : { definition };
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
		const definitions: WiktionarySense[] = [];
		if (Array.isArray(record.definitions)) {
			for (const entry of record.definitions) {
				if (!entry || typeof entry !== "object") continue;
				const recordEntry = entry as Record<string, unknown>;
				const definition = plainDefinitionText(recordEntry.definition);
				if (!definition) continue;
				definitions.push(toSense(definition, firstDefinitionExample(recordEntry)));
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
 * Examples ride along with kept senses and do not count toward the cap.
 */
export function capDefinitionSenses(meanings: WiktionaryMeaning[]): DefinitionSenseGroup[] {
	const byPos = new Map<string, DefinitionSense[]>();
	const order: string[] = [];

	for (const meaning of meanings) {
		const partOfSpeech = meaning.partOfSpeech.trim() || "unknown";
		if (!byPos.has(partOfSpeech)) {
			byPos.set(partOfSpeech, []);
			order.push(partOfSpeech);
		}
		const bucket = byPos.get(partOfSpeech);
		if (!bucket || bucket.length >= MAX_SENSES_PER_POS) continue;
		for (const item of meaning.definitions) {
			if (bucket.length >= MAX_SENSES_PER_POS) break;
			const definition = item.definition.trim();
			if (!definition) continue;
			const example = item.example?.trim();
			bucket.push(toSense(definition, example));
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
