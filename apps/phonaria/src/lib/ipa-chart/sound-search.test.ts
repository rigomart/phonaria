import { describe, expect, it } from "vitest";
import {
	createChartSoundSearchValidator,
	getChartPathForPhoneme,
	parseChartSound,
} from "./sound-search";

describe("chart sound search", () => {
	it("accepts a sound from the chart's own category", () => {
		expect(parseChartSound("T", "en-us", "consonants")).toBe("T");
		expect(parseChartSound("AE", "en-us", "vowels")).toBe("AE");
		expect(parseChartSound("OU", "en-us", "vowels")).toBe("OU");
	});

	it("reads IDs without regard to case or surrounding space", () => {
		expect(parseChartSound(" sh ", "en-us", "consonants")).toBe("SH");
	});

	it("drops sounds from the other chart", () => {
		expect(parseChartSound("AE", "en-us", "consonants")).toBeUndefined();
		expect(parseChartSound("T", "en-us", "vowels")).toBeUndefined();
	});

	it("lets Frequency select any sound in the accent", () => {
		expect(parseChartSound("T", "en-us", "all")).toBe("T");
		expect(parseChartSound("AE", "en-us", "all")).toBe("AE");
	});

	it("drops unknown IDs, sounds outside the accent and non-strings", () => {
		expect(parseChartSound("nope", "en-us", "all")).toBeUndefined();
		expect(parseChartSound("constructor", "en-us", "all")).toBeUndefined();
		// /x/ is in the Spanish inventory only.
		expect(parseChartSound("X", "en-us", "consonants")).toBeUndefined();
		expect(parseChartSound(["T"], "en-us", "consonants")).toBeUndefined();
		expect(parseChartSound(undefined, "en-us", "consonants")).toBeUndefined();
	});

	it("always returns the sound key from the route validator", () => {
		const validate = createChartSoundSearchValidator("en-us", "consonants");
		expect(validate({ sound: "t" })).toEqual({ sound: "T" });
		expect(validate({ sound: "AE" })).toEqual({ sound: undefined });
		expect(validate({})).toEqual({ sound: undefined });
	});

	it("links each sound to the chart that shows it", () => {
		expect(getChartPathForPhoneme("T")).toBe("/ipa-chart/consonants");
		expect(getChartPathForPhoneme("AE")).toBe("/ipa-chart/vowels");
		expect(getChartPathForPhoneme("AI")).toBe("/ipa-chart/vowels");
	});
});
