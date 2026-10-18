import { describe, expect, it } from "vitest";
import {
	angularDistance,
	HORIZON_FADE,
	horizonOpacity,
	invertOrthographic,
	orthographic,
	RAD,
	toLonLat,
	toVector,
	wrapLongitude,
} from "./sphere";

describe("sphere", () => {
	it("wraps longitudes into [-180, 180)", () => {
		expect(wrapLongitude(190)).toBe(-170);
		expect(wrapLongitude(-190)).toBe(170);
		expect(wrapLongitude(180)).toBe(-180);
		expect(wrapLongitude(45)).toBe(45);
	});

	it("measures great-circle distances", () => {
		expect(angularDistance([0, 0], [90, 0])).toBeCloseTo(Math.PI / 2);
		expect(angularDistance([0, 90], [123, -90])).toBeCloseTo(Math.PI);
		expect(angularDistance([179, 0], [-179, 0])).toBeCloseTo(2 * RAD);
	});

	it("converts between places and vectors", () => {
		const [lon, lat] = toLonLat(toVector(-73.5, 40.7));
		expect(lon).toBeCloseTo(-73.5);
		expect(lat).toBeCloseTo(40.7);
	});

	it("projects the view's center to the middle, east to the right and north up", () => {
		const center = [10, 50] as const;
		expect(orthographic(10, 50, center)).toMatchObject({ x: 0, z: 1 });
		expect(orthographic(10, 50, center).y).toBeCloseTo(0);
		expect(orthographic(12, 50, center).x).toBeGreaterThan(0);
		expect(orthographic(10, 52, center).y).toBeLessThan(0);
		expect(orthographic(100, 0, [10, 0]).x).toBeCloseTo(1);
	});

	it("puts places on the far side behind the globe", () => {
		expect(orthographic(-170, -50, [10, 50]).z).toBeCloseTo(-1);
		expect(orthographic(100, 0, [10, 0]).z).toBeCloseTo(0);
		expect(orthographic(150, 0, [10, 0]).z).toBeLessThan(0);
	});

	it("inverts the projection", () => {
		const center = [140, -30] as const;
		const { x, y } = orthographic(150, -20, center);
		const [lon, lat] = invertOrthographic(x, y, center);
		expect(lon).toBeCloseTo(150);
		expect(lat).toBeCloseTo(-20);
	});

	it("hides pins behind the horizon and fades them just before it", () => {
		expect(horizonOpacity(-0.5)).toBe(0);
		expect(horizonOpacity(0)).toBe(0);
		expect(horizonOpacity(HORIZON_FADE / 2)).toBeCloseTo(0.5);
		expect(horizonOpacity(HORIZON_FADE)).toBe(1);
		expect(horizonOpacity(1)).toBe(1);
	});
});
