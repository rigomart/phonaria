import type { VowelPhoneme } from "shared-data";

export const HEIGHT_ORDER: Array<VowelPhoneme["articulation"]["height"]> = [
	"high",
	"near-high",
	"high-mid",
	"mid",
	"low-mid",
	"near-low",
	"low",
];

export const FRONTNESS_ORDER: Array<VowelPhoneme["articulation"]["frontness"]> = [
	"front",
	"near-front",
	"central",
	"near-back",
	"back",
];

export const HEIGHT_LABELS: Record<(typeof HEIGHT_ORDER)[number], string> = {
	high: "Close",
	"near-high": "Near-close",
	"high-mid": "Close-mid",
	mid: "Mid",
	"low-mid": "Open-mid",
	"near-low": "Near-open",
	low: "Open",
};

export const FRONTNESS_LABELS: Record<(typeof FRONTNESS_ORDER)[number], string> = {
	front: "Front",
	"near-front": "Near-front",
	central: "Central",
	"near-back": "Near-back",
	back: "Back",
};

// Helper functions for grid positioning and cell keys
export function getCellKey(
	height: VowelPhoneme["articulation"]["height"],
	frontness: VowelPhoneme["articulation"]["frontness"],
): string {
	return `${height}-${frontness}`;
}

export function getCellPosition(
	height: VowelPhoneme["articulation"]["height"],
	frontness: VowelPhoneme["articulation"]["frontness"],
): { row: number; col: number } {
	return {
		row: HEIGHT_ORDER.indexOf(height),
		col: FRONTNESS_ORDER.indexOf(frontness),
	};
}
