import { describe, expect, it } from "vitest";
import {
	nextThrottle,
	SPIN_EASE_MS,
	SPIN_RESUME_MS,
	SPIN_TURN_MS,
	spinAllowed,
	spinDegrees,
	spinWanted,
} from "./spin";

const open = { stepSpins: true, landed: true, reducedMotion: false, hidden: false, inView: true };

describe("spinning the globe", () => {
	it("turns once every 90 to 120 seconds at full speed", () => {
		expect(SPIN_TURN_MS).toBeGreaterThanOrEqual(90_000);
		expect(SPIN_TURN_MS).toBeLessThanOrEqual(120_000);
		expect(spinDegrees(1, SPIN_TURN_MS)).toBeCloseTo(360);
	});

	it("eases in and out over about a second", () => {
		expect(spinDegrees(0, 1000)).toBe(0);
		expect(spinDegrees(0.5, 1000)).toBeCloseTo(spinDegrees(1, 1000) / 2);
		expect(spinDegrees(0.1, 1000)).toBeLessThan(spinDegrees(1, 1000) * 0.1);
		expect(nextThrottle(0, true, SPIN_EASE_MS / 2)).toBeCloseTo(0.5);
		expect(nextThrottle(0.5, true, SPIN_EASE_MS)).toBe(1);
		expect(nextThrottle(1, false, SPIN_EASE_MS / 4)).toBeCloseTo(0.75);
		expect(nextThrottle(0.2, false, SPIN_EASE_MS)).toBe(0);
	});

	it("only spins at a spinning step, once landed, with motion on and the map in view", () => {
		expect(spinAllowed(open)).toBe(true);
		expect(spinAllowed({ ...open, stepSpins: false })).toBe(false);
		expect(spinAllowed({ ...open, landed: false })).toBe(false);
		expect(spinAllowed({ ...open, reducedMotion: true })).toBe(false);
		expect(spinAllowed({ ...open, hidden: true })).toBe(false);
		expect(spinAllowed({ ...open, inView: false })).toBe(false);
	});

	it("pauses while held and resumes a while after", () => {
		expect(spinWanted(true, true, 0, 10_000)).toBe(false);
		expect(spinWanted(true, false, 5000, 5000 + SPIN_RESUME_MS - 1)).toBe(false);
		expect(spinWanted(true, false, 5000, 5000 + SPIN_RESUME_MS)).toBe(true);
		expect(spinWanted(false, false, -Infinity, 10_000)).toBe(false);
	});
});
