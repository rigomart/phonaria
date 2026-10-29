import { describe, expect, it } from "vitest";
import { loadLand, mayBeVisible } from "./land";
import { decodeLand, encodeLand, type LandPolygon } from "./land-codec";
import { toVector } from "./sphere";
import { WORLD_LAND_COARSE, WORLD_LAND_FINE } from "./world-land";

const square = (lon: number, lat: number, size: number): LandPolygon => [
	[
		[lon, lat],
		[lon + size, lat],
		[lon + size, lat + size],
		[lon, lat + size],
		[lon, lat],
	],
];

describe("land data", () => {
	it("round-trips polygons through the text encoding to a hundredth of a degree", () => {
		const polygons = [square(-3.25, 50.5, 2), square(178.5, -18.13, 1.5)];
		const decoded = decodeLand(encodeLand(polygons));
		expect(decoded).toHaveLength(2);
		decoded.forEach((polygon, p) => {
			polygon[0].forEach(([lon, lat], i) => {
				expect(lon).toBeCloseTo(polygons[p][0][i][0], 2);
				expect(lat).toBeCloseTo(polygons[p][0][i][1], 2);
			});
		});
	});

	it("covers the world from whole-globe views down to England, Antarctica included", () => {
		for (const encoded of [WORLD_LAND_COARSE, WORLD_LAND_FINE]) {
			const land = loadLand(encoded);
			const rings = land.map((shape) => shape.polygon.coordinates[0]);
			expect(rings.some((ring) => ring.some(([, lat]) => lat < -80))).toBe(true);
			const reachesCornwallAndScotland = (ring: (typeof rings)[number]) =>
				ring.some(([lon, lat]) => lon < -5 && lat < 50.3) &&
				ring.some(([lon, lat]) => lon > -5 && lat > 58.3);
			expect(rings.some(reachesCornwallAndScotland)).toBe(true);
		}
		expect(loadLand(WORLD_LAND_FINE).length).toBeGreaterThan(loadLand(WORLD_LAND_COARSE).length);
	});

	it("culls land that can't reach the screen", () => {
		const [island] = loadLand(encodeLand([square(0, 0, 2)]));
		expect(mayBeVisible(island, toVector(1, 1), 0.1)).toBe(true);
		expect(mayBeVisible(island, toVector(30, 0), 0.1)).toBe(false);
		expect(mayBeVisible(island, toVector(30, 0), Math.PI / 2)).toBe(true);
		expect(mayBeVisible(island, toVector(-179, 0), Math.PI / 2)).toBe(false);
	});
});
