import { describe, expect, it } from "vitest";
import { AREA_OPACITY, phaseOf, pinOpacity, ROUTE_LOOK, revealDelay } from "./scene";

describe("story phases on the globe", () => {
	it("draws past and current arrows, muting the past, and undraws the future", () => {
		expect(phaseOf(2, 5)).toBe("past");
		expect(phaseOf(5, 5)).toBe("current");
		expect(phaseOf(6, 5)).toBe("future");
		expect(ROUTE_LOOK.past).toEqual({ progress: 1, emphasis: 0 });
		expect(ROUTE_LOOK.current).toEqual({ progress: 1, emphasis: 1 });
		expect(ROUTE_LOOK.future.progress).toBe(0);
		expect(AREA_OPACITY.future).toBe(0);
		expect(AREA_OPACITY.past).toBeLessThan(AREA_OPACITY.current);
	});

	it("reveals a step once the camera is mostly there", () => {
		expect(revealDelay(0)).toBe(0);
		expect(revealDelay(2000)).toBeGreaterThan(revealDelay(1000));
		expect(revealDelay(2000)).toBeLessThan(2000);
	});
});

describe("which pins can be seen and reached", () => {
	const [width, height] = [1269, 752];
	const head = { width: 82, height: 40 };

	it("shows pins on the near side within the map, fading at the horizon", () => {
		expect(pinOpacity(1, 640, 400, head, width, height)).toBe(1);
		expect(pinOpacity(0.1, 640, 400, head, width, height)).toBeGreaterThan(0);
		expect(pinOpacity(0.1, 640, 400, head, width, height)).toBeLessThan(1);
		expect(pinOpacity(-0.1, 640, 400, head, width, height)).toBe(0);
	});

	it("hides a near-side pin whose head is off the map, as at the printing step", () => {
		expect(pinOpacity(1, 1340, 120, head, width, height)).toBe(0);
		expect(pinOpacity(1, -50, 400, head, width, height)).toBe(0);
	});

	it("needs at least half the head's width on the map", () => {
		expect(pinOpacity(1, width, 400, head, width, height)).toBe(1);
		expect(pinOpacity(1, width + 1, 400, head, width, height)).toBe(0);
		expect(pinOpacity(1, 0, 400, head, width, height)).toBe(1);
		expect(pinOpacity(1, -1, 400, head, width, height)).toBe(0);
	});

	it("needs the head's full height on the map", () => {
		expect(pinOpacity(1, 640, head.height, head, width, height)).toBe(1);
		expect(pinOpacity(1, 640, head.height - 1, head, width, height)).toBe(0);
		expect(pinOpacity(1, 640, height, head, width, height)).toBe(1);
		expect(pinOpacity(1, 640, height + 1, head, width, height)).toBe(0);
	});
});
