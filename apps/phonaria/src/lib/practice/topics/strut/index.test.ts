import { describe, expect, it } from "vitest";
import { loadWordPoolForTopic } from "../../word-pool";
import { StrutTopic } from "./index";

describe("StrutTopic", () => {
	it("teaches AH and defines five session slots", () => {
		expect(StrutTopic.id).toBe("strut");
		expect(StrutTopic.topicSounds).toEqual(["AH"]);
		expect(StrutTopic.slotSpec).toHaveLength(5);
	});

	it("loads only the 416 approved single-form words through the tier-2 façade", async () => {
		const loaded = await loadWordPoolForTopic(StrutTopic);
		expect(loaded).toHaveLength(416);
		expect(loaded.every(({ variants }) => variants.length === 1)).toBe(true);
		expect(loaded.find(({ word }) => word === "love")?.variants).toEqual(["L AH1 V"]);
		expect(loaded.some(({ word }) => word === "but")).toBe(false);
	});
});
