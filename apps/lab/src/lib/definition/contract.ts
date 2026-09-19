import { z } from "zod";

export const MAX_DEFINITION_WORD_LENGTH = 64;
export const MAX_SENSES_PER_POS = 2;
export const MAX_SENSES_TOTAL = 6;

export const WIKTIONARY_SITE_URL = "https://en.wiktionary.org/";

export const definitionLookupInputSchema = z.object({
	word: z.string().min(1).max(MAX_DEFINITION_WORD_LENGTH),
});

export type DefinitionLookupInput = z.input<typeof definitionLookupInputSchema>;

export type DefinitionSenseGroup = {
	partOfSpeech: string;
	senses: string[];
};

export type DefinitionLookupOutput =
	| { found: true; word: string; groups: DefinitionSenseGroup[] }
	| { found: false };

export type DefinitionFailureKind = "validation" | "retryable" | "rate_limit";

export class DefinitionError extends Error {
	readonly kind: DefinitionFailureKind;
	readonly retryable: boolean;
	readonly status?: number;

	constructor(kind: DefinitionFailureKind, message: string) {
		super(message);
		this.name = "DefinitionError";
		this.kind = kind;
		this.retryable = kind !== "validation";
		if (kind === "rate_limit") this.status = 429;
	}
}

export type DefinitionServiceResult =
	| { ok: true; result: DefinitionLookupOutput }
	| { ok: false; error: DefinitionError };
