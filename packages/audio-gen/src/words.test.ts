import { describe, expect, it } from "vitest";
import { collectWordsWithPhonemic, getWordPronunciation } from "./words";

describe("catalog pronunciation inputs", () => {
	it("uses the catalog's 400 words and real ARPAbet rather than generated local mappings", () => {
		const words = collectWordsWithPhonemic();
		expect(words).toHaveLength(400);
		expect(new Set(words.map(({ word }) => word)).size).toBe(400);
		expect(words.find(({ word }) => word === "seat")).toMatchObject({
			variant: "S I1 T",
			cmuArpa: "S IY1 T",
			phonemic: "sit",
		});
		expect(words.find(({ word }) => word === "adapt")).toMatchObject({
			cmuArpa: "AH0 D AE1 P T",
		});
	});
	it("does not silently pick a pronunciation or fall back to plain text", () => {
		expect(() => getWordPronunciation("missing", undefined)).toThrow(/missing/);
		expect(() => getWordPronunciation("read", ["R I1 D", "R E1 D"])).toThrow(/read/);
		expect(() => getWordPronunciation("stress", ["S I1 T", "S I0 T"])).toThrow(/stress/);
		expect(() => getWordPronunciation("bad", ["S EE1 T"])).toThrow();
	});
});
