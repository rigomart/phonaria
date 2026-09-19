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
		expect(senses.some((sense) => /greet/i.test(sense.definition))).toBe(true);
		const examples = senses.map((sense) => sense.example).filter((example) => Boolean(example));
		if (examples.length === 0) {
			throw new Error(
				"Live Wiktionary hello payload had senses but no examples; expected at least one parsed/plain example",
			);
		}
	}, 15_000);
});
