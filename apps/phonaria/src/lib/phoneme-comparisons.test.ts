import { describe, expect, it } from "vitest";
import { getPhonemeComparisons } from "./phoneme-comparisons";

describe("getPhonemeComparisons", () => {
	it("lists partner sounds with pairs led by the looked-up sound", () => {
		const fromI = getPhonemeComparisons("en-us", "I").find(({ partnerId }) => partnerId === "IX");
		const fromIx = getPhonemeComparisons("en-us", "IX").find(({ partnerId }) => partnerId === "I");

		expect(fromI?.partnerIpa).toBe("ɪ");
		expect(fromI?.pairs[0]?.words).toEqual(["seat", "sit"]);
		expect(fromIx?.pairs[0]?.words).toEqual(["sit", "seat"]);
	});

	it("limits the pairs per partner", () => {
		for (const comparison of getPhonemeComparisons("en-us", "AE", 1)) {
			expect(comparison.pairs).toHaveLength(1);
		}
	});

	it("is empty for sounds without contrasts and accents without contrast data", () => {
		expect(getPhonemeComparisons("en-us", "H")).toEqual([]);
		expect(getPhonemeComparisons("es-419", "B")).toEqual([]);
	});
});
