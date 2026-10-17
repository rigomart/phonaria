import { describe, expect, it } from "vitest";
import { activeStepIndex } from "./scroll-step";

describe("activeStepIndex", () => {
	const anchor = 400;

	it("stays on the first step before any card reaches the anchor", () => {
		expect(activeStepIndex([600, 1400, 2200], anchor)).toBe(0);
	});

	it("moves to each card as its top reaches the anchor", () => {
		expect(activeStepIndex([400, 1200, 2000], anchor)).toBe(0);
		expect(activeStepIndex([-500, 399, 1200], anchor)).toBe(1);
		expect(activeStepIndex([-2000, -1200, -400], anchor)).toBe(2);
	});

	it("reverses when scrolling back", () => {
		const tops = (scrollY: number) => [0, 800, 1600].map((top) => top - scrollY);
		const forward = [0, 500, 1300, 1700].map((y) => activeStepIndex(tops(y), anchor));
		const back = [1700, 1300, 500, 0].map((y) => activeStepIndex(tops(y), anchor));
		expect(forward).toEqual([0, 1, 2, 2]);
		expect(back).toEqual([2, 2, 1, 0]);
	});

	it("returns 0 for an empty story", () => {
		expect(activeStepIndex([], anchor)).toBe(0);
	});
});
