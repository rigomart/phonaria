import type { CSSProperties } from "react";

/** Starts an `enter-*` animation after `ms`, for delays computed per item. */
export function enterDelay(ms: number): CSSProperties {
	return { "--enter-delay": `${Math.round(ms)}ms` } as CSSProperties;
}

/**
 * Milliseconds before item `index` of a staggered collection enters. Items past
 * `cap` share its delay, so a long list finishes before anyone scrolls to it.
 */
export function stagger(
	index: number,
	{
		start = 0,
		step,
		cap = Number.POSITIVE_INFINITY,
	}: { start?: number; step: number; cap?: number },
): number {
	return start + Math.min(index, cap) * step;
}

/** Curves for animations started from script. `emphasized` is motion.css's `--ease-emphasized`. */
export const EASE = {
	/** Decelerates into place, for things arriving. */
	emphasized: "cubic-bezier(0.2, 0, 0, 1)",
	/** Accelerates away, for things leaving. */
	exit: "cubic-bezier(0.3, 0, 1, 1)",
} as const;

export function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
