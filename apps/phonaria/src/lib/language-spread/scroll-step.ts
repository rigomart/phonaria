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
