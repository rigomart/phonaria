import { describe, expect, it } from "vitest";
import { isPreferredFlagEnabled, readPreferredEnv } from "./preferred-env";

describe("readPreferredEnv", () => {
	it("prefers the new name when both are set", () => {
		expect(
			readPreferredEnv(
				{
					CONTRACT_TARGET: "cloudflare-staging",
					LAB_CONTRACT_TARGET: "cloudflare-production",
				},
				"CONTRACT_TARGET",
				"LAB_CONTRACT_TARGET",
			),
		).toBe("cloudflare-staging");
	});

	it("falls back to the Lab-era name", () => {
		expect(
			readPreferredEnv(
				{ LAB_CONTRACT_TARGET: "cloudflare-production" },
				"CONTRACT_TARGET",
				"LAB_CONTRACT_TARGET",
			),
		).toBe("cloudflare-production");
	});
});

describe("isPreferredFlagEnabled", () => {
	it("reads 1 or true from the preferred name", () => {
		expect(
			isPreferredFlagEnabled(
				{ CONTRACT_WRITE_BASELINE: "1" },
				"CONTRACT_WRITE_BASELINE",
				"LAB_CONTRACT_WRITE_BASELINE",
			),
		).toBe(true);
		expect(
			isPreferredFlagEnabled(
				{ CONTRACT_WRITE_BASELINE: "true" },
				"CONTRACT_WRITE_BASELINE",
				"LAB_CONTRACT_WRITE_BASELINE",
			),
		).toBe(true);
	});

	it("falls back to the Lab-era flag", () => {
		expect(
			isPreferredFlagEnabled(
				{ LAB_CONTRACT_WRITE_BASELINE: "1" },
				"CONTRACT_WRITE_BASELINE",
				"LAB_CONTRACT_WRITE_BASELINE",
			),
		).toBe(true);
	});

	it("prefers the new flag when both generations are set", () => {
		expect(
			isPreferredFlagEnabled(
				{
					CONTRACT_WRITE_BASELINE: "0",
					LAB_CONTRACT_WRITE_BASELINE: "1",
				},
				"CONTRACT_WRITE_BASELINE",
				"LAB_CONTRACT_WRITE_BASELINE",
			),
		).toBe(false);
	});
});
