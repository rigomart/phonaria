import { describe, expect, it } from "vitest";
import {
	type Camera,
	fitCamera,
	interpolateCamera,
	nearestCopy,
	normalizeCamera,
	toView,
	type Viewport,
} from "./camera";
import { MAP_HEIGHT, MAP_WIDTH, project } from "./projection";

const desktop: Viewport = {
	width: 1280,
	height: 720,
	insets: { top: 0, right: 0, bottom: 0, left: 440 },
};
const phone: Viewport = {
	width: 390,
	height: 780,
	insets: { top: 0, right: 0, bottom: 360, left: 0 },
};
const world = { west: -180, south: -58, east: 180, north: 84 };

/** Where a map point lands on screen for a camera. */
function onScreen(camera: Camera, viewport: Viewport, lon: number, lat: number) {
	const view = toView(camera, viewport);
	const point = project(lon, lat);
	return {
		x: (point.x - view.x) / camera.unitsPerPixel,
		y: (point.y - view.y) / camera.unitsPerPixel,
	};
}

describe("fitCamera", () => {
	it("frames a region in the area the cards leave free", () => {
		const bantu = { west: 5, south: -35, east: 45, north: 10 };
		for (const viewport of [desktop, phone]) {
			const camera = fitCamera(bantu, viewport);
			const corners = [
				onScreen(camera, viewport, bantu.west, bantu.north),
				onScreen(camera, viewport, bantu.east, bantu.south),
			];
			for (const { x, y } of corners) {
				expect(x).toBeGreaterThanOrEqual(viewport.insets.left - 0.5);
				expect(x).toBeLessThanOrEqual(viewport.width - viewport.insets.right + 0.5);
				expect(y).toBeGreaterThanOrEqual(viewport.insets.top - 0.5);
				expect(y).toBeLessThanOrEqual(viewport.height - viewport.insets.bottom + 0.5);
			}
		}
	});

	it("never zooms out past the whole map or in past the zoom limit", () => {
		const everything = fitCamera({ west: -400, south: -80, east: 400, north: 85 }, desktop);
		const wholeMap = fitCamera(world, desktop);
		expect(everything.unitsPerPixel).toBeCloseTo(wholeMap.unitsPerPixel);

		const village = fitCamera({ west: 10, south: 10, east: 10.01, north: 10.01 }, desktop);
		expect(village.unitsPerPixel).toBeCloseTo(wholeMap.unitsPerPixel / 8);
	});

	it("keeps the poles out of view when zoomed in", () => {
		const arctic = fitCamera({ west: -60, south: 70, east: 0, north: 84 }, desktop);
		expect(toView(arctic, desktop).y).toBeGreaterThanOrEqual(0);
		const view = toView(
			fitCamera({ west: -75, south: -58, east: -60, north: -50 }, desktop),
			desktop,
		);
		expect(view.y + view.height).toBeLessThanOrEqual(MAP_HEIGHT + 0.001);
	});

	it("frames across the Pacific when east passes 180", () => {
		const camera = fitCamera({ west: 160, south: -45, east: 200, north: 0 }, desktop);
		expect(camera.x).toBeCloseTo(project(180, 0).x);
		expect(camera.x).toBeCloseTo(MAP_WIDTH);
	});
});

describe("map copies", () => {
	it("picks the copy of a point nearest the camera", () => {
		const tonga = project(-175, -21).x;
		expect(nearestCopy(tonga, MAP_WIDTH)).toBeCloseTo(tonga + MAP_WIDTH);
		expect(nearestCopy(tonga, 100)).toBeCloseTo(tonga);
	});

	it("normalizes a camera to the middle copy without moving the picture", () => {
		const camera = { x: MAP_WIDTH * 1.8, y: 200, unitsPerPixel: 1 };
		expect(normalizeCamera(camera).x).toBeCloseTo(MAP_WIDTH * 0.8);
	});
});

describe("interpolateCamera", () => {
	const from = { x: 100, y: 300, unitsPerPixel: 1 };
	const to = { x: 450, y: 200, unitsPerPixel: 0.25 };

	it("starts and ends exactly on the two cameras", () => {
		expect(interpolateCamera(from, to, 0)).toEqual(from);
		const end = interpolateCamera(from, to, 1);
		expect(end.x).toBeCloseTo(to.x);
		expect(end.y).toBeCloseTo(to.y);
		expect(end.unitsPerPixel).toBeCloseTo(to.unitsPerPixel);
	});

	it("pulls back mid-flight on long moves", () => {
		const middle = interpolateCamera(from, to, 0.5);
		expect(middle.unitsPerPixel).toBeGreaterThan(Math.sqrt(from.unitsPerPixel * to.unitsPerPixel));
	});

	it("takes the short way around the world", () => {
		const americas = { x: project(-150, 0).x, y: 300, unitsPerPixel: 0.5 };
		const pacific = { x: project(170, 0).x, y: 300, unitsPerPixel: 0.5 };
		const middle = interpolateCamera(americas, pacific, 0.5);
		expect(middle.x).toBeLessThan(project(-150, 0).x);
	});
});
