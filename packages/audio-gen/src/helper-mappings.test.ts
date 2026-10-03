import { describe, expect, it } from "vitest";
import { buildWordMappings } from "../../helper-scripts/src/generate-word-mappings";

describe("mapping report consumed by audio tooling", () => {
	it("exports only catalog words and converts the dictionary's internal tokens", () => {
		const report = buildWordMappings({
			seat: ["S I1 T"],
			adapt: ["AX0 D AE1 P T"],
			hello: ["H AX0 L OU1"],
		});
		expect(report.meta.total).toBe(400);
		expect(report.mappings.find(({ word }) => word === "seat")).toMatchObject({
			status: "found",
			cmuArpa: "S IY1 T",
			phonemic: "sit",
		});
		expect(report.mappings.find(({ word }) => word === "adapt")).toMatchObject({
			status: "found",
			cmuArpa: "AH0 D AE1 P T",
		});
		expect(report.mappings.find(({ word }) => word === "hello")).toBeUndefined();
	});
	it("does not provide an API pronunciation for missing or ambiguous words", () => {
		const report = buildWordMappings({ seat: ["S I1 T", "S I0 T"] });
		expect(report.mappings.find(({ word }) => word === "seat")).toMatchObject({
			status: "multiple",
		});
		expect(report.mappings.find(({ word }) => word === "seat")?.cmuArpa).toBeUndefined();
		expect(report.mappings.find(({ word }) => word === "seed")).toMatchObject({
			status: "missing",
		});
	});
});
