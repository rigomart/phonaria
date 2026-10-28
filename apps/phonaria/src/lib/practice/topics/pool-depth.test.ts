import { describe, expect, it } from "vitest";
import { isInSyllableBand } from "../session-generator";
import { loadWordPoolForTopic } from "../word-pool";
import { RColoredVowelTopic } from "./r-colored-vowel";
import { SchwaTopic } from "./schwa";
import { StrutTopic } from "./strut";
import type { TopicDefinition } from "./types";

async function slotsBelowFloor(topic: TopicDefinition, floors: readonly number[]) {
	const pool = await loadWordPoolForTopic(topic);
	return topic.slotSpec.flatMap((band, slot) => {
		const depth = pool.filter((word) => isInSyllableBand(word, band)).length;
		return depth < floors[slot] ? [`slot ${slot + 1}: ${depth} < ${floors[slot]}`] : [];
	});
}

describe("effective curated schwa pool", () => {
	it("meets the approved editorial floors and all five slot floors", async () => {
		const pool = await loadWordPoolForTopic(SchwaTopic);
		for (const [syllables, floor] of [
			[2, 100],
			[3, 100],
			[4, 60],
		]) {
			expect(
				pool.filter((word) => word.syllableCount === syllables).length,
				`${syllables} syllables`,
			).toBeGreaterThanOrEqual(floor);
		}
		expect(pool.filter((word) => word.syllableCount >= 4).length).toBeGreaterThanOrEqual(80);
		expect(await slotsBelowFloor(SchwaTopic, [100, 200, 100, 160, 80])).toEqual([]);
	});
});

describe("effective curated strut pool", () => {
	it("meets all five slot floors", async () => {
		expect(await slotsBelowFloor(StrutTopic, [110, 110, 160, 240, 100])).toEqual([]);
	});
});

describe("effective curated r-colored vowel pool", () => {
	it("meets all five slot floors", async () => {
		expect(await slotsBelowFloor(RColoredVowelTopic, [40, 280, 240, 340, 120])).toEqual([]);
	});
});
