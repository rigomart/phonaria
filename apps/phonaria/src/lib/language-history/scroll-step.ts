/** How far down the viewport, as a share of its height, a step's section must reach to become active. */
export const STEP_ANCHOR = 0.7;

/** Where a section's top comes to rest after jumping to its step, well past the anchor. */
const STEP_REST = 0.5;

/**
 * The step whose card has reached the anchor line: the last card, in story
 * order, whose top is at or above `anchor`. Before the first card arrives, the
 * story is on its first step. `tops` are viewport offsets in story order.
 */
export function activeStepIndex(tops: readonly number[], anchor: number): number {
	let active = 0;
	for (let index = 0; index < tops.length; index += 1) {
		if (tops[index] <= anchor) active = index;
	}
	return active;
}

/**
 * The page scroll that makes a step active, given its section's top as a
 * document offset. The section comes to rest above the anchor line, and the
 * next section, at least a viewport further down, stays below it.
 */
export function stepScrollTop(sectionTop: number, viewportHeight: number): number {
	return Math.max(0, Math.round(sectionTop - viewportHeight * STEP_REST));
}
