import { describe, expect, it } from "vitest";
import { lookupDefinition } from "./service";

/**
 * Live smoke against Wiktionary REST. This test must fail if egress cannot
 * reach en.wiktionary.org — do not skip it or mock fetch here.
 */
describe("Wiktionary live definition lookup", () => {
	it("returns at least one English sense for hello", async () => {
		const result = await lookupDefinition({ word: "hello" });
		if (!result.ok) {
			throw new Error(
				`Live Wiktionary lookup failed (${result.error.kind}): ${result.error.message}`,
			);
		}
		if (!result.result.found) {
			throw new Error("Live Wiktionary lookup returned not found for hello");
		}
		const senses = result.result.groups.flatMap((group) => group.senses);
		expect(senses.length).toBeGreaterThan(0);
		expect(result.result.word).toBe("hello");
		expect(senses.some((sense) => /greet/i.test(sense))).toBe(true);
	}, 15_000);
});
