import { describe, expect, it } from "vitest";
import { project, unproject } from "./projection";
import { WORLD_VIEWBOX } from "./world-land";

const london = project(-0.13, 51.51);
const cairo = project(31.24, 30.04);
const nairobi = project(36.82, -1.29);
const beijing = project(116.41, 39.9);
const jakarta = project(106.85, -6.21);
const sydney = project(151.21, -33.87);

describe("project", () => {
	it("maps the prime meridian and equator to the horizontal center", () => {
		expect(project(0, 0).x).toBeCloseTo(WORLD_VIEWBOX.width / 2, 6);
	});

	it("maps the antimeridian to the left and right edges", () => {
		expect(project(-180, 0).x).toBeCloseTo(0, 6);
		expect(project(180, 0).x).toBeCloseTo(WORLD_VIEWBOX.width, 6);
	});

	it("continues past the antimeridian linearly", () => {
		expect(project(190, 0).x).toBeGreaterThan(WORLD_VIEWBOX.width);
		expect(project(190, 0).x).toBeCloseTo(
			WORLD_VIEWBOX.width + (10 * WORLD_VIEWBOX.width) / 360,
			6,
		);
		expect(project(-190, 0).x).toBeLessThan(0);
	});

	it("tiles every viewbox width", () => {
		for (const [lon, lat] of [
			[-171.8, -13.8],
			[0, 51.5],
			[116.4, 39.9],
		]) {
			expect(project(lon + 360, lat).x).toBeCloseTo(project(lon, lat).x + WORLD_VIEWBOX.width, 6);
			expect(project(lon + 360, lat).y).toBeCloseTo(project(lon, lat).y, 6);
		}
	});

	it("puts north up", () => {
		expect(project(0, 60).y).toBeLessThan(project(0, 0).y);
		expect(project(0, 0).y).toBeLessThan(project(0, -40).y);
	});

	it("spans the viewbox from 84N to 58S", () => {
		expect(project(0, 84).y).toBeCloseTo(0, 6);
		expect(project(0, -58).y).toBeCloseTo(WORLD_VIEWBOX.height, 1);
	});

	it("places known cities in plausible positions", () => {
		expect(london.x).toBeLessThan(beijing.x);
		expect(london.y).toBeLessThan(nairobi.y);
		expect(cairo.y).toBeLessThan(nairobi.y);
		expect(sydney.x).toBeGreaterThan(jakarta.x);
		expect(sydney.y).toBeGreaterThan(jakarta.y);
	});

	it("keeps populated places inside the viewbox with finite coordinates", () => {
		for (const { x, y } of [london, cairo, nairobi, beijing, jakarta, sydney, project(-77, -12)]) {
			expect(Number.isFinite(x)).toBe(true);
			expect(Number.isFinite(y)).toBe(true);
			expect(x).toBeGreaterThanOrEqual(0);
			expect(x).toBeLessThanOrEqual(WORLD_VIEWBOX.width);
			expect(y).toBeGreaterThanOrEqual(0);
			expect(y).toBeLessThanOrEqual(WORLD_VIEWBOX.height);
		}
	});

	it("unprojects back to the same place, wrapping longitude", () => {
		for (const [lon, lat] of [
			[0, 0],
			[-73.2, -41.5],
			[139.5, -17.7],
			[42, 47],
		]) {
			const { x, y } = project(lon, lat);
			const back = unproject(x, y);
			expect(back.lon).toBeCloseTo(lon);
			expect(back.lat).toBeCloseTo(lat);
		}
		expect(unproject(project(190, 10).x, project(190, 10).y).lon).toBeCloseTo(-170);
	});
});
