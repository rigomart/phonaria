import { describe, expect, it } from "vitest";
import { summarizeTopicSounds } from "./topic-sounds";

describe("summarizeTopicSounds", () => {
	it("maps each topic sound to its IPA symbol, in the topic's order", () => {
		expect(summarizeTopicSounds(["AX"]).ipa).toEqual(["ə"]);
		expect(summarizeTopicSounds(["ER", "AX"]).ipa).toEqual(["ɝ", "ə"]);
	});

	it("draws example words from the shipped spelling patterns", () => {
		expect(summarizeTopicSounds(["AX"]).examples).toEqual(["sofa", "lemon"]);
	});

	it("caps examples so a card never becomes a word list", () => {
		expect(summarizeTopicSounds(["ER"]).examples).toHaveLength(3);
	});

	it("shows every sound of a multi-sound topic before repeating one", () => {
		// ER and AX both have examples; the first word of each comes first.
		expect(summarizeTopicSounds(["ER", "AX"]).examples).toEqual(["her", "sofa", "bird"]);
	});

	it("contributes no examples for a sound with no spelling patterns", () => {
		// Spanish-only IDs carry no English spelling patterns.
		expect(summarizeTopicSounds(["EE"]).examples).toEqual([]);
		expect(summarizeTopicSounds(["EE"]).ipa).toEqual(["e"]);
	});
});
