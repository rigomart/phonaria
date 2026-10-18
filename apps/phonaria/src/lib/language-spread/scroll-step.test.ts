import { describe, expect, it } from "vitest";
import { activeStepIndex, STEP_ANCHOR, stepScrollTop } from "./scroll-step";

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

describe("stepScrollTop", () => {
	const viewport = 800;
	const header = 48;
	const sectionHeight = viewport * 1.5;
	const sectionTops = [header, header + sectionHeight, header + sectionHeight * 2];

	it("makes the requested step active and no later one", () => {
		for (const [index, top] of sectionTops.entries()) {
			const scrollY = stepScrollTop(top, viewport);
			const tops = sectionTops.map((sectionTop) => sectionTop - scrollY);
			expect(activeStepIndex(tops, viewport * STEP_ANCHOR)).toBe(index);
		}
	});

	it("never scrolls above the top of the page", () => {
		expect(stepScrollTop(48, viewport)).toBe(0);
	});
});
