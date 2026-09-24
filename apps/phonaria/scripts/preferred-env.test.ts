import { describe, expect, it } from "vitest";
import { readPreferredEnv } from "./preferred-env";

describe("readPreferredEnv", () => {
	it("prefers the new name when both are set", () => {
		expect(
			readPreferredEnv(
				{
					STAGING_URL: "https://new.example.test",
					LAB_START_STAGING_URL: "https://old.example.test",
				},
				"STAGING_URL",
				"LAB_START_STAGING_URL",
			),
		).toBe("https://new.example.test");
	});

	it("falls back to the Lab-era name", () => {
		expect(
			readPreferredEnv(
				{ LAB_START_STAGING_URL: "https://old.example.test" },
				"STAGING_URL",
				"LAB_START_STAGING_URL",
			),
		).toBe("https://old.example.test");
	});

	it("treats blank preferred values as missing", () => {
		expect(
			readPreferredEnv(
				{ STAGING_URL: "  ", LAB_START_STAGING_URL: "https://old.example.test" },
				"STAGING_URL",
				"LAB_START_STAGING_URL",
			),
		).toBe("https://old.example.test");
	});
});
