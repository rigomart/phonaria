import type { VowelArticulatoryFeatures } from "@phonaria/phonetics-data";

export const VOWEL_HEIGHT_ORDER: ReadonlyArray<VowelArticulatoryFeatures["height"]> = [
	"close",
	"near-close",
	"close-mid",
	"mid",
	"open-mid",
	"near-open",
	"open",
] as const;

const heightIndex: Record<VowelArticulatoryFeatures["height"], number> = {
	close: 0,
	"near-close": 1,
	"close-mid": 2,
	mid: 3,
	"open-mid": 4,
	"near-open": 5,
	open: 6,
};

export type VowelChartLayout = {
	viewBoxWidth: number;
	viewBoxHeight: number;
	chartTop: number;
	chartBottom: number;
	frontTopX: number;
	frontBottomX: number;
	backX: number;
};

export const SMALL_VOWEL_CHART_LAYOUT: VowelChartLayout = {
	viewBoxWidth: 160,
	viewBoxHeight: 160,
	chartTop: 32,
	chartBottom: 130,
	frontTopX: 32,
	frontBottomX: 64,
	backX: 150,
};

const VOWEL_BACKNESS_RATIOS: Record<VowelArticulatoryFeatures["backness"], number> = {
	front: 0,
	"near-front": 0.25,
	central: 0.5,
	"near-back": 0.75,
	back: 1,
};

export type ChartPoint = { x: number; y: number };

const getChartHeight = (layout: VowelChartLayout) => layout.chartBottom - layout.chartTop;

export function getHeightPosition(
	height: VowelArticulatoryFeatures["height"],
	layout: VowelChartLayout,
) {
	const normalizedIndex = heightIndex[height] / (VOWEL_HEIGHT_ORDER.length - 1);
	return layout.chartTop + normalizedIndex * getChartHeight(layout);
}

export function getLeftBoundaryX(
	height: VowelArticulatoryFeatures["height"],
	layout: VowelChartLayout,
) {
	const normalizedIndex = heightIndex[height] / (VOWEL_HEIGHT_ORDER.length - 1);
	return layout.frontTopX + (layout.frontBottomX - layout.frontTopX) * normalizedIndex;
}

export function getBacknessPosition(
	backness: VowelArticulatoryFeatures["backness"],
	height: VowelArticulatoryFeatures["height"],
	layout: VowelChartLayout,
) {
	const leftBoundary = getLeftBoundaryX(height, layout);
	const span = layout.backX - leftBoundary;
	return leftBoundary + span * VOWEL_BACKNESS_RATIOS[backness];
}

export function getVowelPoint(
	height: VowelArticulatoryFeatures["height"],
	backness: VowelArticulatoryFeatures["backness"],
	layout: VowelChartLayout,
): ChartPoint {
	return {
		x: getBacknessPosition(backness, height, layout),
		y: getHeightPosition(height, layout),
	};
}
