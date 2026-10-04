/**
 * Display order of a word's variants: the selected one first, the others in the
 * slots they held before. Choosing a variant swaps it with the active one, so
 * only those two move. A previous order that no longer fits `count` is
 * discarded in favour of dictionary order.
 */
export function orderVariants(
	previous: readonly number[],
	selected: number,
	count: number,
): number[] {
	const order = isPermutation(previous, count)
		? [...previous]
		: Array.from({ length: count }, (_, index) => index);
	const slot = order.indexOf(selected);
	if (slot > 0) {
		order[slot] = order[0] as number;
		order[0] = selected;
	}
	return order;
}

function isPermutation(order: readonly number[], count: number): boolean {
	return (
		order.length === count &&
		new Set(order).size === count &&
		order.every((index) => Number.isInteger(index) && index >= 0 && index < count)
	);
}
