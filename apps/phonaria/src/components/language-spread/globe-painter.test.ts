import { describe, expect, it } from "vitest";
import { backingStore, densityQuery } from "./globe-painter";

describe("globe canvas density", () => {
	it("sizes the backing store to the display, capped at twice the CSS size", () => {
		expect(backingStore(390, 844, 1)).toEqual({ ratio: 1, width: 390, height: 844 });
		expect(backingStore(390, 844, 1.5)).toEqual({ ratio: 1.5, width: 585, height: 1266 });
		expect(backingStore(390, 844, 3)).toEqual({ ratio: 2, width: 780, height: 1688 });
		expect(backingStore(100.4, 50, 0)).toEqual({ ratio: 1, width: 100, height: 50 });
	});

	it("writes the media query that matches the current pixel ratio", () => {
		expect(densityQuery(2)).toBe("(resolution: 2dppx)");
		expect(densityQuery(1.25)).toBe("(resolution: 1.25dppx)");
	});
});
