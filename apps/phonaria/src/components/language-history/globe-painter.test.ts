import { describe, expect, it } from "vitest";
import { backingStore, densityQuery, graticule } from "./globe-painter";

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

describe("graticule", () => {
	const { coordinates } = graticule(30);

	it("draws meridians and parallels every 30 degrees", () => {
		const meridians = coordinates.filter((line) => line[0][0] === line[1][0]);
		const parallels = coordinates.filter((line) => line[0][1] === line[1][1]);
		expect(meridians.map((line) => line[0][0])).toEqual([
			-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150,
		]);
		expect(parallels.map((line) => line[0][1])).toEqual([-60, -30, 0, 30, 60]);
		expect(meridians.find((line) => line[0][0] === 0)?.at(-1)).toEqual([0, 90]);
		expect(meridians.find((line) => line[0][0] === 30)?.at(-1)).toEqual([30, 80]);
	});

	// The painter turns off d3's resampling, so a longer gap would draw as a straight chord across the globe.
	it("samples every line at least once a degree", () => {
		for (const line of coordinates) {
			for (let i = 1; i < line.length; i += 1) {
				const gap = Math.max(
					Math.abs(line[i][0] - line[i - 1][0]),
					Math.abs(line[i][1] - line[i - 1][1]),
				);
				expect(gap).toBeLessThanOrEqual(1);
			}
		}
	});
});
