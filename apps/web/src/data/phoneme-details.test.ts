import { phonemeArticulations } from "shared-data";
import { describe, expect, it } from "vitest";
import {
	consonantFeatureDefinitions,
	phonemeDetailsById,
	vowelFeatureDefinitions,
} from "./phoneme-details";

describe("phoneme details data", () => {
	it("exposes details for every articulated phoneme", () => {
		for (const phonemeId of Object.keys(phonemeArticulations)) {
			expect(phonemeDetailsById[phonemeId as keyof typeof phonemeDetailsById]).toBeDefined();
		}
	});

	it("covers every articulation feature with definitions", () => {
		for (const articulation of Object.values(phonemeArticulations)) {
			if (articulation.category === "consonant") {
				expect(
					consonantFeatureDefinitions.manner.values[articulation.features.manner],
				).toBeDefined();
				expect(consonantFeatureDefinitions.place.values[articulation.features.place]).toBeDefined();
				expect(
					consonantFeatureDefinitions.voicing.values[articulation.features.voicing],
				).toBeDefined();
				continue;
			}

			if (
				articulation.category === "vowel/monophthong" ||
				articulation.category === "vowel/rhotic"
			) {
				expect(vowelFeatureDefinitions.height.values[articulation.features.height]).toBeDefined();
				expect(
					vowelFeatureDefinitions.backness.values[articulation.features.backness],
				).toBeDefined();
				expect(
					vowelFeatureDefinitions.roundness.values[articulation.features.roundness],
				).toBeDefined();
				expect(
					vowelFeatureDefinitions.tenseness.values[articulation.features.tenseness],
				).toBeDefined();
			}
		}
	});
});
