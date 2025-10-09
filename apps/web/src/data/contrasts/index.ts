import { FEATURED_CONTRAST_SET_ID, minimalPairSets } from "./sets";
import type { LearningStage, MinimalPairSet } from "./types";

const STAGE_ORDER: LearningStage[] = ["foundation", "core", "situational", "fineTuning"];

const STAGE_LABELS: Record<LearningStage, string> = {
	foundation: "Foundation",
	core: "Core Practice",
	situational: "Situational Focus",
	fineTuning: "Fine-Tuning",
};

const STAGE_DESCRIPTIONS: Partial<Record<LearningStage, string>> = {
	foundation: "Anchor the most common vowel contrasts before layering extras.",
	core: "Reinforce contrasts that appear constantly in daily conversations.",
	situational: "Deploy these when a specific setting or L1 pattern causes confusion.",
	fineTuning: "Polish perception once the core inventory feels steady.",
};

const stagePriority = STAGE_ORDER.reduce<Record<LearningStage, number>>(
	(acc, stage, index) => {
		acc[stage] = index;
		return acc;
	},
	{
		foundation: 0,
		core: 1,
		situational: 2,
		fineTuning: 3,
	},
);

function sortByStage(a: MinimalPairSet, b: MinimalPairSet): number {
	return stagePriority[a.learningStage] - stagePriority[b.learningStage];
}

export function getMinimalPairSets(): MinimalPairSet[] {
	return [...minimalPairSets].sort(sortByStage);
}

export function getSetsByStage(stage: LearningStage): MinimalPairSet[] {
	return minimalPairSets.filter((set) => set.learningStage === stage);
}

export function findSetBySlugOrId(value: string): MinimalPairSet | null {
	const needle = value.trim().toLowerCase();
	return (
		minimalPairSets.find((set) => set.slug === needle || set.id === needle) ??
		minimalPairSets.find(
			(set) => set.slug.toLowerCase() === needle || set.id.toLowerCase() === needle,
		) ??
		null
	);
}

export const FEATURED_CONTRAST_ID = FEATURED_CONTRAST_SET_ID;
export const LEARNING_STAGE_ORDER = STAGE_ORDER;
export const LEARNING_STAGE_LABELS = STAGE_LABELS;
export const LEARNING_STAGE_DESCRIPTIONS = STAGE_DESCRIPTIONS;

export type { LearningStage, MinimalPairSet } from "./types";
