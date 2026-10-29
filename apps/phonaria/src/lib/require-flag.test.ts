import { afterEach, describe, expect, it } from "vitest";
import { requireFlag } from "./require-flag";

describe("TanStack requireFlag", () => {
	afterEach(() => {
		delete process.env.FLAG_PRACTICE;
		delete process.env.FLAG_LANGUAGE_HISTORY;
		delete process.env.FLAG_SPEECH;
	});

	it("allows Practice when FLAG_PRACTICE is on", () => {
		process.env.FLAG_PRACTICE = "1";
		expect(() => requireFlag("practice")).not.toThrow();
	});

	it("throws not-found when FLAG_PRACTICE is off", () => {
		process.env.FLAG_PRACTICE = "0";
		expect(() => requireFlag("practice")).toThrow();
	});

	it("allows History when FLAG_LANGUAGE_HISTORY is on", () => {
		process.env.FLAG_LANGUAGE_HISTORY = "1";
		expect(() => requireFlag("languageHistory")).not.toThrow();
	});

	it("throws not-found when FLAG_LANGUAGE_HISTORY is off", () => {
		process.env.FLAG_LANGUAGE_HISTORY = "0";
		expect(() => requireFlag("languageHistory")).toThrow();
	});

	it("allows minimal-pair speaking when FLAG_SPEECH is on, even with Practice off", () => {
		process.env.FLAG_SPEECH = "1";
		process.env.FLAG_PRACTICE = "0";
		expect(() => requireFlag("speech")).not.toThrow();
	});

	it("throws not-found when FLAG_SPEECH is off", () => {
		process.env.FLAG_SPEECH = "0";
		expect(() => requireFlag("speech")).toThrow();
	});
});
