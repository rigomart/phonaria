import { describe, expect, it } from "vitest";
import { isInSyllableBand } from "../session-generator";
import { loadWordPoolForTopic } from "../word-pool";
import { SchwaTopic } from "./schwa";

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
		const floors = [100, 200, 100, 160, 80];
		SchwaTopic.slotSpec.forEach((band, slot) => {
			expect(
				pool.filter((word) => isInSyllableBand(word, band)).length,
				`slot ${slot + 1}`,
			).toBeGreaterThanOrEqual(floors[slot]);
		});
	});
});
