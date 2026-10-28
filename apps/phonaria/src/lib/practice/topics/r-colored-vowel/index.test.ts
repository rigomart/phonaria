import { describe, expect, it } from "vitest";
import { loadWordPoolForTopic } from "../../word-pool";
import { RColoredVowelTopic } from "./index";

describe("RColoredVowelTopic", () => {
	it("teaches ER and defines five session slots", () => {
		expect(RColoredVowelTopic.id).toBe("r-colored-vowel");
		expect(RColoredVowelTopic.topicSounds).toEqual(["ER"]);
		expect(RColoredVowelTopic.slotSpec).toHaveLength(5);
	});

	it("loads only the 452 approved single-form words through the tier-2 façade", async () => {
		const loaded = await loadWordPoolForTopic(RColoredVowelTopic);
		expect(loaded).toHaveLength(452);
		expect(loaded.every(({ variants }) => variants.length === 1)).toBe(true);
		expect(loaded.find(({ word }) => word === "bird")?.variants).toEqual(["B ER1 D"]);
		expect(loaded.some(({ word }) => word === "power")).toBe(false);
	});
});
