/** A value easing from `from` to `to` over `duration` ms, starting at time `start`. */
export type Tween = { from: number; to: number; start: number; duration: number };

export const restingTween = (value: number): Tween => ({
	from: value,
	to: value,
	start: 0,
	duration: 0,
});

/** Cubic ease-in-out. */
export function easeInOut(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function tweenAt(tween: Tween, now: number): number {
	if (now >= tween.start + tween.duration) return tween.to;
	if (now <= tween.start) return tween.from;
	return tween.from + (tween.to - tween.from) * easeInOut((now - tween.start) / tween.duration);
}

export const tweenDone = (tween: Tween, now: number) => now >= tween.start + tween.duration;

/**
 * Heads `tween` for `to` from wherever it is at `now`, after `delay`. A tween
 * already heading there keeps going, so retargeting twice doesn't restart it.
 */
export function retarget(
	tween: Tween,
	to: number,
	now: number,
	{ delay = 0, duration }: { delay?: number; duration: number },
): void {
	if (tween.to === to) return;
	tween.from = tweenAt(tween, now);
	tween.to = to;
	tween.start = now + delay;
	tween.duration = duration;
}

/** Jumps straight to `value`, as with reduced motion. */
export function rest(tween: Tween, value: number): void {
	tween.from = value;
	tween.to = value;
	tween.start = 0;
	tween.duration = 0;
}
