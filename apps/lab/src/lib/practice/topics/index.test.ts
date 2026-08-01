import { describe, expect, it } from "vitest";
import { getTopic, listTopics } from "./index";

describe("topic registry", () => {
	it("resolves the schwa topic by slug", () => {
		expect(getTopic("schwa")?.id).toBe("schwa");
	});

	it("returns undefined for unknown slugs", () => {
		expect(getTopic("clusters")).toBeUndefined();
	});

	it("lists every registered topic", () => {
		expect(listTopics().map((t) => t.id)).toEqual(["schwa"]);
	});
});
