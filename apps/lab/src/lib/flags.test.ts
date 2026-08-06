import { afterEach, describe, expect, it } from "vitest";
import { isFlagEnabled } from "./flags";

describe("isFlagEnabled", () => {
	const original = process.env.FLAG_PRACTICE;

	afterEach(() => {
		if (original === undefined) {
			delete process.env.FLAG_PRACTICE;
		} else {
			process.env.FLAG_PRACTICE = original;
		}
	});

	it("treats '1' and 'true' (any case) as enabled", () => {
		for (const value of ["1", "true", "TRUE", "True"]) {
			process.env.FLAG_PRACTICE = value;
			expect(isFlagEnabled("practice")).toBe(true);
		}
	});

	it("treats any other value as disabled", () => {
		for (const value of ["0", "false", "off", "yes"]) {
			process.env.FLAG_PRACTICE = value;
			expect(isFlagEnabled("practice")).toBe(false);
		}
	});

	it("falls back to the default when unset or empty", () => {
		// Tests run with NODE_ENV !== "production", so the default is enabled.
		delete process.env.FLAG_PRACTICE;
		expect(isFlagEnabled("practice")).toBe(true);
		process.env.FLAG_PRACTICE = "";
		expect(isFlagEnabled("practice")).toBe(true);
	});
});
