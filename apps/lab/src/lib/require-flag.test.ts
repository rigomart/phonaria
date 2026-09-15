import { afterEach, describe, expect, it } from "vitest";
import { requireFlag } from "./require-flag";

describe("TanStack requireFlag", () => {
	afterEach(() => {
		delete process.env.FLAG_PRACTICE;
	});

	it("allows Practice when FLAG_PRACTICE is on", () => {
		process.env.FLAG_PRACTICE = "1";
		expect(() => requireFlag("practice")).not.toThrow();
	});

	it("throws not-found when FLAG_PRACTICE is off", () => {
		process.env.FLAG_PRACTICE = "0";
		expect(() => requireFlag("practice")).toThrow();
	});
});
