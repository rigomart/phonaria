export const SPIN_TURN_MS = 100_000;
export const SPIN_EASE_MS = 1000;
/** After the reader stops interacting, the globe waits this long before turning again. */
export const SPIN_RESUME_MS = 2000;

const DEGREES_PER_MS = 360 / SPIN_TURN_MS;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Whether the globe may spin at all, whatever the reader is doing. */
export function spinAllowed({
	stepSpins,
	landed,
	reducedMotion,
	hidden,
	inView,
}: {
	stepSpins: boolean;
	landed: boolean;
	reducedMotion: boolean;
	hidden: boolean;
	inView: boolean;
}): boolean {
	return stepSpins && landed && !reducedMotion && !hidden && inView;
}

/**
 * Whether the globe should be turning at `now`: allowed, not held by the
 * reader (hovering, focus, open details), and at least SPIN_RESUME_MS since
 * the last hold ended at `releasedAt`.
 */
export function spinWanted(allowed: boolean, held: boolean, releasedAt: number, now: number) {
	return allowed && !held && now - releasedAt >= SPIN_RESUME_MS;
}

/** The spin's throttle, 0 to 1, `elapsed` ms later, easing toward full or still. */
export function nextThrottle(throttle: number, wanted: boolean, elapsed: number): number {
	const step = elapsed / SPIN_EASE_MS;
	return Math.min(1, Math.max(0, throttle + (wanted ? step : -step)));
}

/** Degrees of longitude the globe turns over `elapsed` ms at `throttle`, eased at both ends. */
export function spinDegrees(throttle: number, elapsed: number): number {
	return DEGREES_PER_MS * smoothstep(throttle) * elapsed;
}
