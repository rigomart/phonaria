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
