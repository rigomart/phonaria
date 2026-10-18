import { describe, expect, it } from "vitest";
import {
	type Bounds,
	type Camera,
	fitCamera,
	flightCamera,
	GLOBE_FIT,
	isFarMove,
	planFlight,
	unitRadius,
	type Viewport,
	visibleRadius,
	zoomOf,
} from "./camera";
import { angularDistance, orthographic } from "./sphere";

const laptop: Viewport = {
	width: 1280,
	height: 752,
	insets: { top: 110, right: 24, bottom: 24, left: 430 },
};
const phone: Viewport = {
	width: 390,
	height: 796,
	insets: { top: 90, right: 12, bottom: 380, left: 12 },
};

const WORLD: Bounds = { west: -170, south: -56, east: 190, north: 78 };
const ENGLAND: Bounds = { west: -6, south: 50, east: 2, north: 55.8 };
const NORMANDY: Bounds = { west: -4, south: 47.5, east: 3, north: 52 };
const VIRGINIA: Bounds = { west: -84, south: 35, east: -74, north: 40.5 };
const SYDNEY: Bounds = { west: 148, south: -36, east: 154, north: -31 };
const STEPPE: Bounds = { west: 30, south: 40, east: 60, north: 55 };

const screenPoint = (camera: Camera, lon: number, lat: number) => {
	const { x, y } = orthographic(lon, lat, [camera.lon, camera.lat]);
	return { x: camera.x + x * camera.radius, y: camera.y + y * camera.radius };
};

describe("fitting a region on the globe", () => {
	it("frames the whole world as the whole globe, inside the free area with a margin", () => {
		for (const viewport of [laptop, phone]) {
			const camera = fitCamera(WORLD, viewport);
			expect(zoomOf(camera, viewport)).toBeCloseTo(GLOBE_FIT);
			const { insets, width, height } = viewport;
			expect(camera.x - camera.radius).toBeGreaterThan(insets.left);
			expect(camera.x + camera.radius).toBeLessThan(width - insets.right);
			expect(camera.y - camera.radius).toBeGreaterThan(insets.top);
			expect(camera.y + camera.radius).toBeLessThan(height - insets.bottom);
		}
	});

	it("centres a region in the area the cards leave free", () => {
		const camera = fitCamera(ENGLAND, laptop);
		expect(camera.x).toBeCloseTo((430 + 1280 - 24) / 2);
		expect(camera.y).toBeCloseTo((110 + 752 - 24) / 2);
		expect(camera.lon).toBeCloseTo(-2, 0);
		expect(camera.lat).toBeGreaterThan(52);
		expect(camera.lat).toBeLessThan(54);
	});

	it("zooms in on England far enough to fill the free area", () => {
		for (const viewport of [laptop, phone]) {
			const camera = fitCamera(ENGLAND, viewport);
			expect(zoomOf(camera, viewport)).toBeGreaterThan(8);
			const { insets, width, height } = viewport;
			for (const [lon, lat] of [
				[-6, 50],
				[2, 50],
				[-6, 55.8],
				[2, 55.8],
			]) {
				const { x, y } = screenPoint(camera, lon, lat);
				expect(x).toBeGreaterThanOrEqual(insets.left - 0.5);
				expect(x).toBeLessThanOrEqual(width - insets.right + 0.5);
				expect(y).toBeGreaterThanOrEqual(insets.top - 0.5);
				expect(y).toBeLessThanOrEqual(height - insets.bottom + 0.5);
			}
		}
	});

	it("frames a region across the antimeridian from its middle", () => {
		const camera = fitCamera({ west: 160, south: -48, east: 260, north: 25 }, laptop);
		expect(camera.lon).toBeGreaterThan(-170);
		expect(camera.lon).toBeLessThan(-130);
	});

	it("never zooms out past the whole globe, nor in without limit", () => {
		expect(zoomOf(fitCamera(WORLD, laptop), laptop)).toBeGreaterThanOrEqual(GLOBE_FIT);
		const spot = fitCamera({ west: 0, south: 51, east: 0.01, north: 51.01 }, laptop);
		expect(Number.isFinite(spot.radius)).toBe(true);
		expect(zoomOf(spot, laptop)).toBeLessThanOrEqual(32);
	});

	it("sees a quarter turn around its center from the whole globe, and less when zoomed in", () => {
		expect(visibleRadius(fitCamera(WORLD, laptop), laptop)).toBeCloseTo(Math.PI / 2);
		expect(visibleRadius(fitCamera(ENGLAND, laptop), laptop)).toBeLessThan(0.1);
	});
});

describe("camera flights", () => {
	const camera = (bounds: Bounds, viewport = laptop) => fitCamera(bounds, viewport);

	it("pulls back for far moves and only pans for near ones", () => {
		for (const viewport of [laptop, phone]) {
			const at = (bounds: Bounds) => camera(bounds, viewport);
			expect(isFarMove(at(WORLD), at(STEPPE), viewport)).toBe(false);
			expect(isFarMove(at(ENGLAND), at(NORMANDY), viewport)).toBe(false);
			expect(isFarMove(at(ENGLAND), at(WORLD), viewport)).toBe(false);
			expect(isFarMove(at(ENGLAND), at(VIRGINIA), viewport)).toBe(true);
			expect(isFarMove(at(ENGLAND), at(SYDNEY), viewport)).toBe(true);
		}
	});

	it("dips to about the whole globe halfway through a far flight", () => {
		const flight = planFlight(camera(ENGLAND), camera(VIRGINIA), laptop);
		expect(flight.far).toBe(true);
		const middle = flightCamera(flight, 0.5);
		expect(zoomOf(middle, laptop)).toBeLessThan(1.2);
		expect(zoomOf(middle, laptop)).toBeGreaterThanOrEqual(GLOBE_FIT - 1e-9);
		const sydney = flightCamera(planFlight(camera(ENGLAND), camera(SYDNEY), laptop), 0.5);
		expect(zoomOf(sydney, laptop)).toBeCloseTo(GLOBE_FIT);
	});

	it("changes zoom geometrically and without a dip on near flights", () => {
		const from = camera(ENGLAND);
		const to = camera(NORMANDY);
		const flight = planFlight(from, to, laptop);
		expect(flight.far).toBe(false);
		const low = Math.min(from.radius, to.radius);
		const high = Math.max(from.radius, to.radius);
		for (let t = 0; t <= 1; t += 0.05) {
			const { radius } = flightCamera(flight, t);
			expect(radius).toBeGreaterThanOrEqual(low - 1e-6);
			expect(radius).toBeLessThanOrEqual(high + 1e-6);
		}
		const globe = camera(WORLD);
		const zoomIn = planFlight(globe, from, laptop);
		expect(
			flightCamera(zoomIn, 0.5).radius,
			"halfway in eased time the radius is the geometric mean",
		).toBeCloseTo(Math.sqrt(globe.radius * from.radius), 3);
	});

	it("turns along the great circle between the two centers", () => {
		const from = camera(ENGLAND);
		const to = camera(SYDNEY);
		const flight = planFlight(from, to, laptop);
		for (const t of [0.2, 0.5, 0.8]) {
			const mid = flightCamera(flight, t);
			const via =
				angularDistance([from.lon, from.lat], [mid.lon, mid.lat]) +
				angularDistance([mid.lon, mid.lat], [to.lon, to.lat]);
			expect(via).toBeCloseTo(flight.distance, 6);
		}
	});

	it("can be kept near, without the pull-back", () => {
		const flight = planFlight(camera(ENGLAND), camera(VIRGINIA), laptop, { near: true });
		expect(flight.far).toBe(false);
		expect(zoomOf(flightCamera(flight, 0.5), laptop)).toBeGreaterThan(8);
	});

	it("starts and lands exactly on its cameras", () => {
		const from = camera(ENGLAND);
		const to = camera(VIRGINIA);
		const flight = planFlight(from, to, laptop);
		const start = flightCamera(flight, 0);
		expect(start.lon).toBeCloseTo(from.lon);
		expect(start.lat).toBeCloseTo(from.lat);
		expect(start.radius).toBeCloseTo(from.radius);
		expect(flightCamera(flight, 1)).toEqual(to);
		expect(flightCamera(flight, 1.5)).toEqual(to);
	});

	it("takes longer the farther it goes, within 0.9 to 2.2 seconds", () => {
		const near = planFlight(camera(ENGLAND), camera(NORMANDY), laptop);
		const far = planFlight(camera(ENGLAND), camera(VIRGINIA), laptop);
		const farthest = planFlight(camera(ENGLAND), camera(SYDNEY), laptop);
		expect(near.duration).toBeGreaterThanOrEqual(900);
		expect(far.duration).toBeGreaterThan(near.duration);
		expect(farthest.duration).toBeGreaterThanOrEqual(far.duration);
		expect(farthest.duration).toBeLessThanOrEqual(2200);
	});

	it("measures zoom against the globe that exactly fits the free area", () => {
		expect(unitRadius(laptop)).toBe((752 - 110 - 24) / 2);
		expect(unitRadius(phone)).toBe((796 - 90 - 380) / 2);
	});
});
