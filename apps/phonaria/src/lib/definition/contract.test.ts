import { describe, expect, it } from "vitest";
import {
	DefinitionError,
	definitionLookupInputSchema,
	MAX_DEFINITION_WORD_LENGTH,
} from "./contract";

describe("definitionLookupInputSchema", () => {
	it("accepts a non-empty word", () => {
		expect(definitionLookupInputSchema.safeParse({ word: "hello" }).success).toBe(true);
	});

	it("accepts a word at the 64-character limit", () => {
		expect(
			definitionLookupInputSchema.safeParse({ word: "a".repeat(MAX_DEFINITION_WORD_LENGTH) })
				.success,
		).toBe(true);
	});

	it("rejects an empty word", () => {
		expect(definitionLookupInputSchema.safeParse({ word: "" }).success).toBe(false);
	});

	it("rejects a word longer than 64 characters", () => {
		expect(
			definitionLookupInputSchema.safeParse({ word: "a".repeat(MAX_DEFINITION_WORD_LENGTH + 1) })
				.success,
		).toBe(false);
	});

	it("rejects a missing word field", () => {
		expect(definitionLookupInputSchema.safeParse({}).success).toBe(false);
	});
});

describe("DefinitionError", () => {
	it("marks rate-limit failures as HTTP 429 and retryable", () => {
		const error = new DefinitionError("rate_limit", "Too many definition requests");
		expect(error.status).toBe(429);
		expect(error.retryable).toBe(true);
		expect(error.kind).toBe("rate_limit");
	});

	it("does not mark validation as retryable", () => {
		const error = new DefinitionError("validation", "Invalid definition lookup");
		expect(error.retryable).toBe(false);
		expect(error.status).toBeUndefined();
	});
});
