import { describe, expect, it } from "vitest";

import {
	findSetBySlugOrId,
	getMinimalPairSets,
	getSetsByStage,
	LEARNING_STAGE_ORDER,
} from "./index";

describe("contrast data helpers", () => {
	it("returns sets ordered by learning stage", () => {
		const sets = getMinimalPairSets();
		expect(sets.length).toBeGreaterThan(0);

		const stagePositions = sets.map((set) => LEARNING_STAGE_ORDER.indexOf(set.learningStage));
		const sortedPositions = [...stagePositions].sort((a, b) => a - b);

		expect(stagePositions).toEqual(sortedPositions);
	});

	it("filters sets by stage", () => {
		const foundationSets = getSetsByStage("foundation");

		expect(foundationSets.length).toBeGreaterThan(0);
		foundationSets.forEach((set) => {
			expect(set.learningStage).toBe("foundation");
		});
	});

	it("finds sets by slug or id and returns null when missing", () => {
		const [firstSet] = getMinimalPairSets();
		expect(firstSet).toBeDefined();

		expect(findSetBySlugOrId(firstSet.slug)).toEqual(firstSet);
		expect(findSetBySlugOrId(firstSet.id.toUpperCase())).toEqual(firstSet);
		expect(findSetBySlugOrId("non-existent-contrast")).toBeNull();
	});
});
