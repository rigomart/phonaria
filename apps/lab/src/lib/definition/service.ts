import {
	DefinitionError,
	type DefinitionSenseGroup,
	type DefinitionServiceResult,
	definitionLookupInputSchema,
} from "./contract";
import {
	capDefinitionSenses,
	type DictionaryApiEntry,
	firstDefinedWord,
	isLookupableDefinitionWord,
	normalizeDefinitionWord,
} from "./normalize";

export type DefinitionFetch = (
	input: string,
	init?: { method?: string; headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<Response>;

export type LookupDefinitionDependencies = {
	fetch?: DefinitionFetch;
};

const FREE_DICTIONARY_API_ORIGIN = "https://api.dictionaryapi.dev";
const LOOKUP_TIMEOUT_MS = 8_000;
const UNAVAILABLE_MESSAGE = "We couldn't load that definition. Please try again.";

function validationError(message: string): DefinitionServiceResult {
	return { ok: false, error: new DefinitionError("validation", message) };
}

function retryableError(message: string = UNAVAILABLE_MESSAGE): DefinitionServiceResult {
	return { ok: false, error: new DefinitionError("retryable", message) };
}

function miss(): DefinitionServiceResult {
	return { ok: true, result: { found: false } };
}

function found(word: string, groups: DefinitionSenseGroup[]): DefinitionServiceResult {
	return { ok: true, result: { found: true, word, groups } };
}

export function buildDictionaryLookupUrl(word: string): string {
	return `${FREE_DICTIONARY_API_ORIGIN}/api/v2/entries/en/${encodeURIComponent(word)}`;
}

function parseEntries(payload: unknown): DictionaryApiEntry[] | null {
	if (!Array.isArray(payload)) return null;
	return payload.filter(
		(entry): entry is DictionaryApiEntry => Boolean(entry) && typeof entry === "object",
	);
}

/**
 * Framework-neutral definition lookup. Validates and normalizes the word,
 * fetches Free Dictionary API over the injected fetch, and caps senses.
 */
export async function lookupDefinition(
	input: unknown,
	dependencies: LookupDefinitionDependencies = {},
): Promise<DefinitionServiceResult> {
	const parsed = definitionLookupInputSchema.safeParse(input);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		return validationError(first?.message ?? "Invalid definition lookup");
	}

	const normalized = normalizeDefinitionWord(parsed.data.word);
	if (!isLookupableDefinitionWord(normalized)) {
		return miss();
	}

	const fetchFn = dependencies.fetch ?? fetch;
	const url = buildDictionaryLookupUrl(normalized);

	let response: Response;
	try {
		response = await fetchFn(url, {
			method: "GET",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
		});
	} catch {
		return retryableError();
	}

	if (response.status === 404) return miss();
	if (!response.ok) return retryableError();

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		return retryableError();
	}

	const entries = parseEntries(payload);
	if (!entries || entries.length === 0) return miss();

	const groups = capDefinitionSenses(entries);
	if (groups.length === 0) return miss();

	return found(firstDefinedWord(entries, normalized), groups);
}
