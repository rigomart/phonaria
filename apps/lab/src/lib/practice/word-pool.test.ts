import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";
import { describe, expect, it } from "vitest";
import type { TopicDefinition } from "./topics/types";
import { deriveWordPool, frequencyTierForRank, isSuitableWord } from "./word-pool";

function makeData(words: Record<string, string[]>): CuratedWordData {
	return {
		meta: {
			version: "test",
			tier: "test",
			wordCount: Object.keys(words).length,
			generatedAt: "",
			license: "",
			attribution: "",
			sources: { wordfreq: "", cmudict: "" },
		},
		words,
	};
}

function makeTopic(): TopicDefinition {
	return {
		id: "test-topic",
		topicSounds: ["AX"],
		isEligibleWord: (variants) =>
			variants.every((v) => v.split(" ").some((t) => t.replace(/[012]$/, "") === "AX")),
		slotSpec: [],
		display: {
			kicker: "",
			heading: "",
			description: "",
			startLabel: "",
			topicStatLabel: "",
			lessonsHeading: "",
		},
		selectLessons: () => [],
	};
}

describe("isSuitableWord", () => {
	it("accepts ordinary lowercase words of 3+ letters", () => {
		expect(isSuitableWord("about")).toBe(true);
		expect(isSuitableWord("cat")).toBe(true);
		expect(isSuitableWord("elizabeth")).toBe(true);
	});

	it("rejects words with non-alphabetic characters", () => {
		expect(isSuitableWord("don't")).toBe(false);
		expect(isSuitableWord("o'clock")).toBe(false);
		expect(isSuitableWord("mother-in-law")).toBe(false);
	});

	it("rejects words shorter than 3 letters", () => {
		expect(isSuitableWord("a")).toBe(false);
		expect(isSuitableWord("an")).toBe(false);
	});

	it("rejects blocklisted words", () => {
		for (const blocked of ["etc", "bmw", "aaa", "le", "feb", "aug", "w"]) {
			expect(isSuitableWord(blocked)).toBe(false);
		}
	});
});

describe("deriveWordPool", () => {
	it("composes the shared suitability filter with the topic predicate", () => {
		const data = makeData({
			// eligible: suitable and every variant has AX
			about: ["AX0 B AU1 T"],
			// fails topic predicate: second variant has no AX
			the: ["DH AX0", "DH AH1"],
			// fails suitability (blocklist) even though the topic predicate passes
			etc: ["EH1 T S EH2 T ER0 AX0"],
			// fails suitability (too short)
			ab: ["AX0 B"],
		});
		const pool = deriveWordPool(data, makeTopic());
		expect(pool.map((w) => w.word)).toEqual(["about"]);
	});

	it("computes syllable count, topic-sound count, and positions from the first variant", () => {
		const data = makeData({
			about: ["AX0 B AU1 T"],
			banana: ["B AX0 N AE1 N AX0"],
			believer: ["B I1 K AX0 T I1"],
		});
		const pool = deriveWordPool(data, makeTopic());
		const byWord = new Map(pool.map((w) => [w.word, w]));

		const about = byWord.get("about");
		expect(about?.syllableCount).toBe(2);
		expect(about?.topicSoundCount).toBe(1);
		expect(about?.topicSoundPositions).toEqual(["initial"]);

		const banana = byWord.get("banana");
		expect(banana?.syllableCount).toBe(3);
		expect(banana?.topicSoundCount).toBe(2);
		expect(banana?.topicSoundPositions).toEqual(["initial", "final"]);

		const believer = byWord.get("believer");
		expect(believer?.syllableCount).toBe(3);
		expect(believer?.topicSoundPositions).toEqual(["medial"]);
	});

	it("records frequency rank and tier from data order", () => {
		const data = makeData({
			about: ["AX0 B AU1 T"],
			the: ["DH AH1"],
			banana: ["B AX0 N AE1 N AX0"],
		});
		const pool = deriveWordPool(data, makeTopic());
		const banana = pool.find((w) => w.word === "banana");
		expect(banana?.rank).toBe(2);
		expect(banana?.frequencyTier).toBe("top-1k");
	});
});

describe("frequencyTierForRank", () => {
	it("bands ranks into 1k / 5k / 10k tiers", () => {
		expect(frequencyTierForRank(0)).toBe("top-1k");
		expect(frequencyTierForRank(999)).toBe("top-1k");
		expect(frequencyTierForRank(1000)).toBe("top-5k");
		expect(frequencyTierForRank(4999)).toBe("top-5k");
		expect(frequencyTierForRank(5000)).toBe("top-10k");
	});
});
