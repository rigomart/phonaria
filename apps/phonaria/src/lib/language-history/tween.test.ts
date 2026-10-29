import { describe, expect, it } from "vitest";
import { rest, restingTween, retarget, tweenAt, tweenDone } from "./tween";

describe("tweens", () => {
	it("eases from its value to its target after a delay", () => {
		const tween = restingTween(0);
		retarget(tween, 1, 1000, { delay: 200, duration: 400 });
		expect(tweenAt(tween, 1100)).toBe(0);
		expect(tweenAt(tween, 1400)).toBeCloseTo(0.5);
		expect(tweenAt(tween, 1600)).toBe(1);
		expect(tweenDone(tween, 1599)).toBe(false);
		expect(tweenDone(tween, 1600)).toBe(true);
	});

	it("turns back from wherever it is", () => {
		const tween = restingTween(0);
		retarget(tween, 1, 0, { duration: 400 });
		const midway = tweenAt(tween, 200);
		retarget(tween, 0, 200, { duration: 400 });
		expect(tweenAt(tween, 200)).toBeCloseTo(midway);
		expect(tweenAt(tween, 600)).toBe(0);
	});

	it("keeps going when retargeted to where it is already heading", () => {
		const tween = restingTween(0);
		retarget(tween, 1, 0, { duration: 400 });
		retarget(tween, 1, 300, { duration: 400 });
		expect(tweenAt(tween, 400)).toBe(1);
	});

	it("jumps when resting", () => {
		const tween = restingTween(0);
		retarget(tween, 1, 0, { duration: 400 });
		rest(tween, 0.4);
		expect(tweenAt(tween, 100)).toBe(0.4);
		expect(tweenDone(tween, 0)).toBe(true);
	});
});
