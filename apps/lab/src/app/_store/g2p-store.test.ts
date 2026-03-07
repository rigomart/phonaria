import { afterEach, describe, expect, it } from "vitest";
import type { TranscriptionResult } from "@/lib/types/g2p";
import { useG2PStore } from "./g2p-store";

const mockResult: TranscriptionResult = {
	originalText: "hello world",
	words: [
		{
			word: "hello",
			variants: [],
			selectedVariantIndex: 0,
			wordIndex: 0,
			source: "cmudict",
		},
		{
			word: "world",
			variants: [],
			selectedVariantIndex: 0,
			wordIndex: 1,
			source: "cmudict",
		},
	],
	timestamp: new Date(),
};

afterEach(() => {
	useG2PStore.getState().clearResult();
});

describe("g2p-store", () => {
	it("has null initial state", () => {
		const state = useG2PStore.getState();
		expect(state.currentResult).toBeNull();
		expect(state.selectedVariants).toEqual([]);
	});

	it("sets current result", () => {
		useG2PStore.getState().setCurrentResult(mockResult);
		expect(useG2PStore.getState().currentResult).toBe(mockResult);
	});

	it("clears result", () => {
		useG2PStore.getState().setCurrentResult(mockResult);
		useG2PStore.getState().clearResult();
		expect(useG2PStore.getState().currentResult).toBeNull();
		expect(useG2PStore.getState().selectedVariants).toEqual([]);
	});

	it("resets variants for word count", () => {
		useG2PStore.getState().resetVariants(3);
		expect(useG2PStore.getState().selectedVariants).toEqual([0, 0, 0]);
	});

	it("sets a specific variant", () => {
		useG2PStore.getState().resetVariants(3);
		useG2PStore.getState().setVariant(1, 2);
		expect(useG2PStore.getState().selectedVariants).toEqual([0, 2, 0]);
	});

	it("preserves other variants when setting one", () => {
		useG2PStore.getState().resetVariants(3);
		useG2PStore.getState().setVariant(0, 1);
		useG2PStore.getState().setVariant(2, 3);
		expect(useG2PStore.getState().selectedVariants).toEqual([1, 0, 3]);
	});
});
