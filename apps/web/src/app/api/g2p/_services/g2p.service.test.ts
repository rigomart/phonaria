import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServiceStats } from "./g2p.service";

// Mock the dependencies (must match import paths used in g2p.service.ts)
vi.mock("../_lib/cmudict", () => ({
	cmudict: {
		load: vi.fn().mockResolvedValue(undefined),
		lookup: vi.fn(),
	},
}));

vi.mock("../_lib/fallback-g2p", () => ({
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
	});

	describe("transcribeText()", () => {
		it("returns empty words for empty/whitespace input", async () => {
			const { transcribeText } = await import("./g2p.service");
			expect(await transcribeText({ text: "" })).toEqual({ words: [] });
			expect(await transcribeText({ text: "   " })).toEqual({ words: [] });
		});

		it("loads the dictionary and passes through IPA tokens from cmudict", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("../_lib/cmudict");

			vi.mocked(cmudict.lookup).mockReturnValue([["h", "ə", "ˈ", "l", "oʊ"]]);

			const res = await transcribeText({ text: "hello" });
			expect(cmudict.load).toHaveBeenCalled();
			expect(res.words).toEqual([{ word: "hello", variants: [["h", "ə", "ˈ", "l", "oʊ"]] }]);
		});

		it("falls back to fallback G2P for unknown words", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("../_lib/cmudict");
			const { fallbackG2P } = await import("../_lib/fallback-g2p");

			vi.mocked(cmudict.lookup).mockReturnValue(undefined);
			vi.mocked(fallbackG2P.generatePronunciation).mockReturnValue(["t", "ɛ", "s", "t"]);

			const result = await transcribeText({ text: "unknownword" });

			expect(result).toEqual({
				words: [{ word: "unknownword", variants: [["t", "ɛ", "s", "t"]] }],
			});
			expect(cmudict.lookup).toHaveBeenCalledWith("unknownword");
			expect(fallbackG2P.generatePronunciation).toHaveBeenCalledWith("unknownword");
		});

		it("tokenizes basic sentences (punctuation, contractions, case)", async () => {
			const { transcribeText } = await import("./g2p.service");
			const { cmudict } = await import("../_lib/cmudict");
			const { fallbackG2P } = await import("../_lib/fallback-g2p");

			vi.mocked(cmudict.lookup).mockReturnValue(undefined);
			vi.mocked(fallbackG2P.generatePronunciation).mockReturnValue(["t", "ɛ", "s", "t"]);

			const withPunct = await transcribeText({ text: "Hello, world! How are you?" });
			expect(withPunct.words.map((w) => w.word)).toEqual(["hello", "world", "how", "are", "you"]);

			const withContractions = await transcribeText({ text: "don't can't won't" });
			expect(withContractions.words.map((w) => w.word)).toEqual(["don't", "can't", "won't"]);

			const withCase = await transcribeText({ text: "HELLO World TeSt" });
			expect(withCase.words.map((w) => w.word)).toEqual(["hello", "world", "test"]);
		});
	});
});
