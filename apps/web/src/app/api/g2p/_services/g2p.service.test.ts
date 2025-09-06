import { beforeEach, describe, expect, it, vi } from "vitest";
import type { G2PRequest } from "../_schemas/g2p-api.schema";
import { getServiceStats } from "./g2p.service";

// Mock the dependencies
vi.mock("./cmudict", () => ({
	cmudict: {
		load: vi.fn().mockResolvedValue(undefined),
		lookup: vi.fn(),
	},
}));

vi.mock("./fallback-g2p", () => ({
	fallbackG2P: {
		generatePronunciation: vi.fn(),
	},
}));

describe("G2P Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getServiceStats()", () => {
		it("returns correct service statistics", () => {
			const stats = getServiceStats();

			expect(stats).toEqual({
				serviceName: "cmudict-g2p",
				isHealthy: true,
				description: "CMU Dictionary G2P service",
			});
		});

		it("returns consistent results", () => {
			const stats1 = getServiceStats();
			const stats2 = getServiceStats();

			expect(stats1).toEqual(stats2);
		});
	});

	describe("transcribeText() basic functionality", () => {
		it("handles empty text input", async () => {
			const { transcribeText } = await import("./g2p.service");
			const request: G2PRequest = { text: "" };
			const result = await transcribeText(request);

			expect(result).toEqual({ words: [] });
		});

		it("handles whitespace-only text input", async () => {
			const { transcribeText } = await import("./g2p.service");
			const request: G2PRequest = { text: "   " };
			const result = await transcribeText(request);

			expect(result).toEqual({ words: [] });
		});

		it("loads dictionary before processing", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("./cmudict");

			const request: G2PRequest = { text: "hello" };

			// Mock successful dictionary lookup
			vi.mocked(cmudict.lookup).mockReturnValue([["h", "ə", "l", "oʊ"]]);

			await transcribeText(request);

			expect(cmudict.load).toHaveBeenCalled();
		});

		it("falls back to fallback G2P for unknown words", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("./cmudict");
			const { fallbackG2P } = await import("./fallback-g2p");

			const request: G2PRequest = { text: "unknownword" };

			// Mock dictionary returning no results
			vi.mocked(cmudict.lookup).mockReturnValue(undefined);

			// Mock fallback G2P
			vi.mocked(fallbackG2P.generatePronunciation).mockReturnValue(["ʌ", "n", "n", "oʊ", "n"]);

			const result = await transcribeText(request);

			expect(result).toEqual({
				words: [{ word: "unknownword", variants: [["ʌ", "n", "n", "oʊ", "n"]] }],
			});

			expect(cmudict.lookup).toHaveBeenCalledWith("unknownword");
			expect(fallbackG2P.generatePronunciation).toHaveBeenCalledWith("unknownword");
		});
	});

	describe("text tokenization", () => {
		it("handles punctuation correctly", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("./cmudict");
			const { fallbackG2P } = await import("./fallback-g2p");

			// Mock all words as unknown to test tokenization
			vi.mocked(cmudict.lookup).mockReturnValue(undefined);
			vi.mocked(fallbackG2P.generatePronunciation).mockReturnValue(["t", "ɛ", "s", "t"]);

			const request: G2PRequest = { text: "Hello, world! How are you?" };

			const result = await transcribeText(request);

			// Should extract words without punctuation
			expect(result.words).toHaveLength(5);
			expect(result.words.map((w) => w.word)).toEqual(["hello", "world", "how", "are", "you"]);
		});

		it("preserves contractions", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("./cmudict");
			const { fallbackG2P } = await import("./fallback-g2p");

			vi.mocked(cmudict.lookup).mockReturnValue(undefined);
			vi.mocked(fallbackG2P.generatePronunciation).mockReturnValue(["t", "ɛ", "s", "t"]);

			const request: G2PRequest = { text: "don't can't won't" };

			const result = await transcribeText(request);

			expect(result.words.map((w) => w.word)).toEqual(["don't", "can't", "won't"]);
		});

		it("converts words to lowercase", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("./cmudict");
			const { fallbackG2P } = await import("./fallback-g2p");

			vi.mocked(cmudict.lookup).mockReturnValue(undefined);
			vi.mocked(fallbackG2P.generatePronunciation).mockReturnValue(["t", "ɛ", "s", "t"]);

			const request: G2PRequest = { text: "HELLO World TeSt" };

			const result = await transcribeText(request);

			expect(result.words.map((w) => w.word)).toEqual(["hello", "world", "test"]);
		});
	});
});
