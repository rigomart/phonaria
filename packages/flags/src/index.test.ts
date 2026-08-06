import { afterEach, describe, expect, it } from "vitest";
import { createFlags } from "./index";

const flags = createFlags({
	demo: { envVar: "FLAG_DEMO", enabledByDefault: false },
	fallback: { envVar: "FLAG_FALLBACK", enabledByDefault: true },
});

describe("createFlags", () => {
	afterEach(() => {
		delete process.env.FLAG_DEMO;
		delete process.env.FLAG_FALLBACK;
	});

	it("treats '1' and 'true' (any case) as enabled", () => {
		for (const value of ["1", "true", "TRUE", "True"]) {
			process.env.FLAG_DEMO = value;
			expect(flags.isEnabled("demo")).toBe(true);
		}
	});

	it("treats any other value as disabled", () => {
		for (const value of ["0", "false", "off", "yes"]) {
			process.env.FLAG_FALLBACK = value;
			expect(flags.isEnabled("fallback")).toBe(false);
		}
	});

	it("falls back to the flag's default when unset or empty", () => {
		expect(flags.isEnabled("demo")).toBe(false);
		expect(flags.isEnabled("fallback")).toBe(true);
		process.env.FLAG_DEMO = "";
		expect(flags.isEnabled("demo")).toBe(false);
	});

	it("snapshots every flag's current value", () => {
		process.env.FLAG_DEMO = "true";
		expect(flags.snapshot()).toEqual({ demo: true, fallback: true });
	});
});
