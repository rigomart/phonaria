import { describe, expect, it } from "vitest";
import { orderVariants } from "./variant-order";

describe("orderVariants", () => {
	it("starts in dictionary order with the selected variant first", () => {
		expect(orderVariants([], 0, 3)).toEqual([0, 1, 2]);
		expect(orderVariants([], 2, 3)).toEqual([2, 1, 0]);
	});

	it("swaps the chosen variant with the active one and leaves the rest in place", () => {
		expect(orderVariants([0, 1, 2, 3], 2, 4)).toEqual([2, 1, 0, 3]);
		expect(orderVariants([2, 1, 0, 3], 3, 4)).toEqual([3, 1, 0, 2]);
	});

	it("keeps the order when the selected variant is already active", () => {
		expect(orderVariants([1, 0, 2], 1, 3)).toEqual([1, 0, 2]);
	});

	it("discards a previous order that does not fit the variant count", () => {
		expect(orderVariants([1, 0], 2, 3)).toEqual([2, 1, 0]);
		expect(orderVariants([0, 0, 1], 1, 3)).toEqual([1, 0, 2]);
		expect(orderVariants([0, 1, 5], 0, 3)).toEqual([0, 1, 2]);
	});

	it("handles a word with a single variant", () => {
		expect(orderVariants([], 0, 1)).toEqual([0]);
	});
});
