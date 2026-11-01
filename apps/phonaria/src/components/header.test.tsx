import { describe, expect, it } from "vitest";
import { betaNotice } from "./header";

describe("betaNotice", () => {
	it("names scores only while speech scoring ships", () => {
		expect(betaNotice({ speech: true })).toContain("scores");
		expect(betaNotice({ speech: false })).not.toContain("scores");
	});
});
