import { describe, expect, it } from "vitest";
import { FallbackG2P, fallbackG2P } from "./phoneme-generator";

describe("FallbackG2P", () => {
	it("returns correct phoneme count for word", () => {
		const result = fallbackG2P.generatePronunciation("hello");
		expect(result).toHaveLength(1);
		expect(result[0].phonemes).toHaveLength(5);
	});

	it("sets all phonemeId to null", () => {
		const result = fallbackG2P.generatePronunciation("cat");
		for (const phoneme of result[0].phonemes) {
			expect(phoneme.phonemeId).toBeNull();
		}
	});

	it("sets stress to none", () => {
		const result = fallbackG2P.generatePronunciation("test");
		expect(result[0].stress).toBe("none");
	});

	it("uses each character as cmuToken", () => {
		const result = fallbackG2P.generatePronunciation("abc");
		expect(result[0].phonemes[0].cmuToken).toBe("a");
		expect(result[0].phonemes[1].cmuToken).toBe("b");
		expect(result[0].phonemes[2].cmuToken).toBe("c");
	});

	it("handles single character word", () => {
		const result = fallbackG2P.generatePronunciation("a");
		expect(result[0].phonemes).toHaveLength(1);
	});

	it("exports a singleton instance", () => {
		expect(fallbackG2P).toBeInstanceOf(FallbackG2P);
	});
});
