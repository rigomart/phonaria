import { describe, expect, it } from "vitest";
import {
	freeDictionaryErrorSchema,
	freeDictionarySuccessSchema,
} from "../../dictionary/_schemas/dictionary-schemas";
import { dictionaryQuerySchema } from "../../dictionary/_services/dictionary-service";

describe("dictionary schemas", () => {
	it("validates success shape (subset)", () => {
		const sample = [
			{
				word: "test",
				meanings: [
					{
						partOfSpeech: "noun",
						definitions: [{ definition: "A challenge, trial." }],
					},
				],
			},
		];
		expect(() => freeDictionarySuccessSchema.parse(sample)).not.toThrow();
	});

	it("validates error shape", () => {
		const sample = {
			title: "No Definitions Found",
			message: "Sorry pal, we couldn't find definitions for the word you were looking for.",
			resolution: "You can try the search again at later time...",
		};
		expect(() => freeDictionaryErrorSchema.parse(sample)).not.toThrow();
	});

	it("validates dictionary query", () => {
		expect(() => dictionaryQuerySchema.parse({ word: "hello" })).not.toThrow();
		expect(() => dictionaryQuerySchema.parse({ word: "" })).toThrow();
	});
});
