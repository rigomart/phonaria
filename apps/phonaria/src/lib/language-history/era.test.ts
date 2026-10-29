import { describe, expect, it } from "vitest";
import { eraYear, formatEra, formatMaybeEra } from "./era";

describe("formatEra", () => {
	it("labels every era as approximate except today", () => {
		expect(formatEra({ yearsAgo: 70000 })).toBe("~70,000 years ago");
		expect(formatEra({ bce: 4000 })).toBe("~4000 BCE");
		expect(formatEra({ ce: 1500 })).toBe("~1500 CE");
		expect(formatEra("today")).toBe("Today");
	});

	it("labels ranges between two estimates", () => {
		expect(formatEra({ yearsAgo: 65000, to: 50000 })).toBe("~65,000–50,000 years ago");
		expect(formatEra({ ce: 1025, to: 1290 })).toBe("~1025–1290 CE");
	});
});

describe("formatMaybeEra", () => {
	it("keeps BCE and CE capitalised and reads naturally mid-sentence when unknown", () => {
		expect(formatMaybeEra({ ce: 1500 })).toBe("~1500 CE");
		expect(formatMaybeEra(undefined)).toBe("no agreed date");
	});
});

describe("eraYear", () => {
	it("orders deep time, BCE, CE and today", () => {
		const eras = [{ yearsAgo: 60000 }, { bce: 3000 }, { ce: 700 }, "today"] as const;
		const years = eras.map(eraYear);
		expect([...years].sort((a, b) => a - b)).toEqual(years);
	});
});
