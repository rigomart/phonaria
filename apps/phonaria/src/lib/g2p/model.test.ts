import { describe, expect, it } from "vitest";
import { g2pRequestSchema, g2pResponseSchema, g2pWordSchema } from "./model";

describe("g2pRequestSchema", () => {
	it("accepts valid text input", () => {
		const result = g2pRequestSchema.safeParse({ text: "hello world" });
		expect(result.success).toBe(true);
	});

	it("rejects empty text", () => {
		const result = g2pRequestSchema.safeParse({ text: "" });
		expect(result.success).toBe(false);
	});

	it("rejects text longer than 200 characters", () => {
		const result = g2pRequestSchema.safeParse({ text: "a".repeat(201) });
		expect(result.success).toBe(false);
	});

	it("accepts text at exactly 200 characters", () => {
		const result = g2pRequestSchema.safeParse({ text: "a".repeat(200) });
		expect(result.success).toBe(true);
	});

	it("accepts text with punctuation", () => {
		const result = g2pRequestSchema.safeParse({ text: "Hello, world!" });
		expect(result.success).toBe(true);
	});
});

describe("g2pWordSchema", () => {
	it("accepts a valid word with known phonemes", () => {
		const result = g2pWordSchema.safeParse({
			word: "hello",
			variants: [
				[
					{
						phonemes: [
							{ ipa: "h", phonemeId: "H", cmuToken: "HH" },
							{ ipa: "ɛ", phonemeId: "E", cmuToken: "EH1" },
						],
						stress: "primary",
					},
				],
			],
			source: "cmudict",
		});
		expect(result.success).toBe(true);
	});

	it("accepts a word with unknown (fallback) phonemes", () => {
		const result = g2pWordSchema.safeParse({
			word: "xyz",
			variants: [
				[
					{
						phonemes: [
							{ phonemeId: null, cmuToken: "x" },
							{ phonemeId: null, cmuToken: "y" },
							{ phonemeId: null, cmuToken: "z" },
						],
						stress: "none",
					},
				],
			],
			source: "fallback",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid source value", () => {
		const result = g2pWordSchema.safeParse({
			word: "test",
			variants: [],
			source: "invalid",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid stress value", () => {
		const result = g2pWordSchema.safeParse({
			word: "test",
			variants: [[{ phonemes: [], stress: "tertiary" }]],
			source: "cmudict",
		});
		expect(result.success).toBe(false);
	});
});

describe("g2pResponseSchema", () => {
	it("accepts a valid response", () => {
		const result = g2pResponseSchema.safeParse({
			words: [
				{
					word: "hello",
					variants: [
						[
							{
								phonemes: [{ ipa: "h", phonemeId: "H", cmuToken: "HH" }],
								stress: "none",
							},
						],
					],
					source: "cmudict",
				},
			],
		});
		expect(result.success).toBe(true);
	});

	it("accepts an empty words array", () => {
		const result = g2pResponseSchema.safeParse({ words: [] });
		expect(result.success).toBe(true);
	});
});
