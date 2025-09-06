import { describe, expect, it } from "vitest";
import {
	type ApiError,
	apiErrorSchema,
	type G2PRequest,
	type G2PResponse,
	type G2PWord,
	g2pRequestSchema,
	g2pResponseSchema,
	g2pWordSchema,
} from "./schemas";

describe("G2P API Schemas", () => {
	describe("g2pRequestSchema", () => {
		it("accepts valid text input", () => {
			const validRequests: G2PRequest[] = [
				{ text: "hello world" },
				{ text: "Test with numbers 123" },
				{ text: "Contractions don't break it" },
				{ text: "Punctuation: Hello, world! How are you?" },
				{ text: "Unicode: café naïve résumé" },
			];

			for (const request of validRequests) {
				expect(() => g2pRequestSchema.parse(request)).not.toThrow();
			}
		});

		it("rejects empty or invalid text", () => {
			const invalidRequests = [
				{ text: "" },
				{ text: "a".repeat(201) }, // too long
			];

			for (const request of invalidRequests) {
				expect(() => g2pRequestSchema.parse(request)).toThrow();
			}
		});

		it("rejects text with unsupported characters", () => {
			// Test what the regex actually rejects
			const invalidRequests = [
				{ text: "Invalid <script> tags" }, // angle brackets are not allowed
				{ text: "emoji 🙂 not allowed" }, // emoji are not allowed
			];

			for (const request of invalidRequests) {
				expect(() => g2pRequestSchema.parse(request)).toThrow();
			}
		});

		it("enforces text length limits", () => {
			expect(() => g2pRequestSchema.parse({ text: "a".repeat(200) })).not.toThrow();
			expect(() => g2pRequestSchema.parse({ text: "a".repeat(201) })).toThrow();
		});
	});

	describe("g2pWordSchema", () => {
		it("accepts valid word objects", () => {
			const validWords: G2PWord[] = [
				{ word: "hello", variants: [["h", "ɛ", "l", "oʊ"]] },
				{ word: "cat", variants: [["k", "æ", "t"]] },
				{ word: "empty", variants: [[]] },
			];

			for (const word of validWords) {
				expect(() => g2pWordSchema.parse(word)).not.toThrow();
			}
		});

		it("rejects invalid word objects", () => {
			const invalidWords = [
				{ word: 123, variants: [["h"]] }, // word not string
				{ word: "hello", variants: "not-array" }, // variants not array
				{ word: "hello", variants: [123] }, // variant not array
				{ word: "hello", variants: [[123]] }, // phoneme not string
			];

			for (const word of invalidWords) {
				expect(() => g2pWordSchema.parse(word as unknown as G2PWord)).toThrow();
			}
		});
	});

	describe("g2pResponseSchema", () => {
		it("accepts valid response objects", () => {
			const validResponses: G2PResponse[] = [
				{ words: [] },
				{
					words: [
						{
							word: "hello",
							variants: [
								["h", "ɛ", "l", "oʊ"],
								["h", "e", "l", "oʊ"],
							],
						},
						{ word: "world", variants: [["w", "ɝ", "l", "d"]] },
					],
				},
			];

			for (const response of validResponses) {
				expect(() => g2pResponseSchema.parse(response)).not.toThrow();
			}
		});

		it("rejects invalid response structure", () => {
			const invalidResponses = [
				{ words: "not-array" },
				{ words: [{ invalid: "structure" }] },
				{ wrongKey: [] },
			];

			for (const response of invalidResponses) {
				expect(() => g2pResponseSchema.parse(response as unknown as G2PResponse)).toThrow();
			}
		});
	});

	describe("apiErrorSchema", () => {
		it("accepts valid error objects", () => {
			const validErrors: ApiError[] = [
				{ error: "ValidationError", message: "Text cannot be empty" },
				{ error: "InternalError", message: "Something went wrong" },
			];

			for (const error of validErrors) {
				expect(() => apiErrorSchema.parse(error)).not.toThrow();
			}
		});

		it("rejects invalid error structure", () => {
			const invalidErrors = [
				{ error: "ValidError" }, // missing message
				{ message: "Valid message" }, // missing error
				{ error: 123, message: "Invalid error type" },
			];

			for (const error of invalidErrors) {
				expect(() => apiErrorSchema.parse(error)).toThrow();
			}
		});
	});
});
