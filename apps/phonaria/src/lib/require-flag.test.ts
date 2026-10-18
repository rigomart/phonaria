import { afterEach, describe, expect, it } from "vitest";
import { requireFlag } from "./require-flag";

describe("TanStack requireFlag", () => {
	afterEach(() => {
		delete process.env.FLAG_PRACTICE;
		delete process.env.FLAG_LANGUAGE_SPREAD;
	});

	it("allows Practice when FLAG_PRACTICE is on", () => {
		process.env.FLAG_PRACTICE = "1";
		expect(() => requireFlag("practice")).not.toThrow();
	});

	it("throws not-found when FLAG_PRACTICE is off", () => {
		process.env.FLAG_PRACTICE = "0";
		expect(() => requireFlag("practice")).toThrow();
	});

	it("allows Language Spread when FLAG_LANGUAGE_SPREAD is on", () => {
		process.env.FLAG_LANGUAGE_SPREAD = "1";
		expect(() => requireFlag("languageSpread")).not.toThrow();
	});

	it("throws not-found when FLAG_LANGUAGE_SPREAD is off", () => {
		process.env.FLAG_LANGUAGE_SPREAD = "0";
		expect(() => requireFlag("languageSpread")).toThrow();
	});
});
