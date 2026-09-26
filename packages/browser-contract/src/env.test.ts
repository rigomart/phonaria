import { describe, expect, it } from "vitest";
import { isFlagEnabled, readEnv } from "./env";

describe("readEnv", () => {
	it("trims a configured value", () => {
		expect(readEnv({ CONTRACT_TARGET: " cloudflare-production " }, "CONTRACT_TARGET")).toBe(
			"cloudflare-production",
		);
	});

	it("treats missing or blank values as unset", () => {
		expect(readEnv({}, "CONTRACT_TARGET")).toBeUndefined();
		expect(readEnv({ CONTRACT_TARGET: "  " }, "CONTRACT_TARGET")).toBeUndefined();
	});
});

describe("isFlagEnabled", () => {
	it("accepts 1 or true, and rejects other values", () => {
		for (const value of ["1", "true"]) {
			expect(isFlagEnabled({ CONTRACT_WRITE_BASELINE: value }, "CONTRACT_WRITE_BASELINE")).toBe(
				true,
			);
		}
		for (const value of ["0", "false", ""]) {
			expect(isFlagEnabled({ CONTRACT_WRITE_BASELINE: value }, "CONTRACT_WRITE_BASELINE")).toBe(
				false,
			);
		}
	});
});
