import type { VowelArticulation } from "shared-data";

export interface VowelPosition {
	x: number;
	y: number;
}

const HEIGHT_INDEX: Record<VowelArticulation["height"], number> = {
	high: 0,
	"near-high": 1,
	"high-mid": 2,
	mid: 3,
	"low-mid": 4,
	"near-low": 5,
	low: 6,
};

const FRONTNESS_INDEX: Record<VowelArticulation["frontness"], number> = {
	front: 0,
	"near-front": 1,
	central: 2,
	"near-back": 3,
	back: 4,
};

export interface VowelChartDimensions {
	width: number;
	height: number;
	padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export const DEFAULT_CHART_DIMENSIONS: VowelChartDimensions = {
	width: 600,
	height: 400,
	padding: {
		top: 40,
		right: 40,
		bottom: 40,
		left: 40,
	},
};

export function getVowelPosition(
	height: VowelArticulation["height"],
	frontness: VowelArticulation["frontness"],
	dimensions: VowelChartDimensions = DEFAULT_CHART_DIMENSIONS,
): VowelPosition {
	const { width, height: chartHeight, padding } = dimensions;

	const availableWidth = width - padding.left - padding.right;
	const availableHeight = chartHeight - padding.top - padding.bottom;

	const heightIndex = HEIGHT_INDEX[height];
	const frontnessIndex = FRONTNESS_INDEX[frontness];

	const heightSteps = Object.keys(HEIGHT_INDEX).length - 1;
	const frontnessSteps = Object.keys(FRONTNESS_INDEX).length - 1;

	const x = padding.left + (frontnessIndex / frontnessSteps) * availableWidth;
	const y = padding.top + (heightIndex / heightSteps) * availableHeight;

	return { x, y };
}

export function getArticulationPosition(
	articulation: Pick<VowelArticulation, "height" | "frontness">,
	dimensions?: VowelChartDimensions,
): VowelPosition {
	return getVowelPosition(articulation.height, articulation.frontness, dimensions);
}
