import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { deriveWordPool, loadWordPoolForTopic } from "../../word-pool";
import { everyVariantContainsSchwa, SchwaTopic } from "./index";

describe("everyVariantContainsSchwa", () => {
	it("accepts words whose every variant contains schwa", () => {
		expect(everyVariantContainsSchwa(["AX0 B AU1 T"])).toBe(true);
		expect(everyVariantContainsSchwa(["B AX0 N AE1 N AX0", "B AX0 N AA1 N AX0"])).toBe(true);
	});

	it("rejects words where any variant lacks schwa — the learner could dodge the sound", () => {
		expect(everyVariantContainsSchwa(["DH AX0", "DH AH1"])).toBe(false);
		expect(everyVariantContainsSchwa(["K AE1 T"])).toBe(false);
	});

	it("rejects an empty variant list", () => {
		expect(everyVariantContainsSchwa([])).toBe(false);
	});
});

describe("SchwaTopic", () => {
	it("teaches AX and defines five session slots", () => {
		expect(SchwaTopic.id).toBe("schwa");
		expect(SchwaTopic.topicSounds).toEqual(["AX"]);
		expect(SchwaTopic.slotSpec).toHaveLength(5);
	});
});

/** Band depth is guaranteed for every topic in `topics/pool-depth.test.ts`. */
describe("schwa word pool over shipped top-10k data", () => {
	const pool = deriveWordPool(EnglishCuratedTop10k, SchwaTopic);

	it("yields the expected pool size (~3,373 words)", () => {
		// Pins the shipped top-10k data. If the data is regenerated, update this
		// deliberately after confirming band depths still hold.
		expect(pool).toHaveLength(3_373);
	});

	it("loads the same pool through the tier-2 façade", async () => {
		const loaded = await loadWordPoolForTopic(SchwaTopic);
		expect(loaded.length).toBe(pool.length);
	});
});
