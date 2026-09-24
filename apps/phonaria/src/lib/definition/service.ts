import {
	DefinitionError,
	type DefinitionSenseGroup,
	type DefinitionServiceResult,
	definitionLookupInputSchema,
} from "./contract";
import { capDefinitionSenses, parseWiktionaryPayload } from "./normalize";
import { isLookupableDefinitionWord, normalizeDefinitionWord } from "./word";

export type DefinitionFetch = (
	input: string,
	init?: { method?: string; headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<Response>;

export type LookupDefinitionDependencies = {
	fetch?: DefinitionFetch;
};

const WIKTIONARY_DEFINITION_ORIGIN = "https://en.wiktionary.org";
const WIKTIONARY_USER_AGENT = "Phonaria/1.0 (https://phonaria.rigos.dev; mirdor.dev@gmail.com)";
const LOOKUP_TIMEOUT_MS = 10_000;
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
	return `${WIKTIONARY_DEFINITION_ORIGIN}/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
}

export function wiktionaryLookupHeaders(): Record<string, string> {
	return {
		Accept: "application/json",
		"User-Agent": WIKTIONARY_USER_AGENT,
		"Api-User-Agent": WIKTIONARY_USER_AGENT,
	};
}

/**
 * Framework-neutral definition lookup. Validates and normalizes the word,
 * fetches Wiktionary REST definitions over the injected fetch, and caps senses.
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
			headers: wiktionaryLookupHeaders(),
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

	const groups = capDefinitionSenses(parseWiktionaryPayload(payload));
	if (groups.length === 0) return miss();

	return found(normalized, groups);
}
