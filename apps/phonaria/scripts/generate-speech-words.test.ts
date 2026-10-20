import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
	buildCatalogPronunciations,
	CATALOG_PRONUNCIATIONS_PATH,
	formatCatalogPronunciations,
} from "./generate-speech-words";

describe("generate-speech-words", () => {
	it("keeps the committed catalog pronunciations in step with the catalog and dictionary", () => {
		expect(
			readFileSync(CATALOG_PRONUNCIATIONS_PATH, "utf8"),
			"run bun apps/phonaria/scripts/generate-speech-words.ts",
		).toBe(formatCatalogPronunciations(buildCatalogPronunciations()));
	});

	it("lists each word once with its distinct pronunciations", () => {
		const pronunciations = buildCatalogPronunciations(
			[
				{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["sheep", "ship"] }] },
				{ id: "s-sh", phonemeIds: ["S", "SH"], minimalPairs: [{ words: ["sip", "ship"] }] },
			],
			{
				ship: ["SH IX1 P"],
				sheep: ["SH I1 P", "SH I2 P"],
				sip: ["S IX1 P"],
			},
		);
		expect(pronunciations).toEqual({
			sheep: [["SH", "I", "P"]],
			ship: [["SH", "IX", "P"]],
			sip: [["S", "IX", "P"]],
		});
	});

	it("fails on a catalog word the dictionary lacks", () => {
		expect(() =>
			buildCatalogPronunciations(
				[{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["sheep", "ship"] }] }],
				{ ship: ["SH IX1 P"] },
			),
		).toThrow(/"sheep"/);
	});
});
