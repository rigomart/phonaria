import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { isInSyllableBand } from "../session-generator";
import { deriveWordPool } from "../word-pool";
import { listTopics } from "./index";

/**
 * A band that runs dry throws mid-session. A session draws at most 2 words per
 * band, so the margin is wide: a data regeneration cannot silently starve one.
 */
const MIN_BAND_DEPTH = 200;

describe.each(
	listTopics().map((topic) => [topic.id, topic] as const),
)("%s word pool over shipped top-10k data", (_id, topic) => {
	const pool = deriveWordPool(EnglishCuratedTop10k, topic);

	it("keeps every syllable band comfortably above slot demand", () => {
		for (const band of topic.slotSpec) {
			const depth = pool.filter((word) => isInSyllableBand(word, band)).length;
			expect(depth, `band ${band.min}–${band.max ?? "∞"}`).toBeGreaterThan(MIN_BAND_DEPTH);
		}
	});
});
