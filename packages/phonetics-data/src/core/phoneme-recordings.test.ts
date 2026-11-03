import { describe, expect, it } from "vitest";
import { getLanguagePhonemeIds } from "../languages/inventories";
import { getPhonemeType } from "./ipa-map";
import { getPhonemeRecordingSource, PhonemeRecordingSourceMap } from "./phoneme-recordings";

describe("phoneme recording sources", () => {
	const nonDiphthongs = getLanguagePhonemeIds("en-us").filter(
		(id) => getPhonemeType(id) !== "diphthong",
	);

	it("credits every English sound but the diphthongs", () => {
		expect(nonDiphthongs).toHaveLength(35);
		expect(nonDiphthongs.filter((id) => getPhonemeRecordingSource(id) === null)).toEqual([]);
	});

	it("has no entry for a diphthong", () => {
		expect(getPhonemeRecordingSource("OI")).toBeNull();
		for (const id of Object.keys(PhonemeRecordingSourceMap)) {
			expect(getPhonemeType(id as keyof typeof PhonemeRecordingSourceMap), id).not.toBe(
				"diphthong",
			);
		}
	});

	it("links each entry to its Commons file page and names an author", () => {
		for (const [id, source] of Object.entries(PhonemeRecordingSourceMap)) {
			expect(source.title, id).toMatch(/^File:.+\.ogg$/);
			expect(source.pageUrl, id).toBe(
				`https://commons.wikimedia.org/wiki/${source.title.replace(/ /g, "_")}`,
			);
			expect(source.authors.length, id).toBeGreaterThan(0);
			expect(source.sha1, id).toMatch(/^[0-9a-f]{40}$/);
		}
	});

	it("marks /ʌ/ and /ɛ/ as earlier versions of their files", () => {
		const earlier = Object.entries(PhonemeRecordingSourceMap)
			.filter(([, source]) => source.earlierVersion)
			.map(([id, source]) => [id, source.earlierVersion]);
		expect(earlier).toEqual([
			["E", "2005-07-20"],
			["AH", "2005-07-20"],
		]);
	});

	it("gives the /dʒ/ recording as public domain and the rest as CC BY-SA 3.0", () => {
		const licenses = Object.entries(PhonemeRecordingSourceMap).map(([id, source]) => [
			id,
			source.license.name,
		]);
		expect(licenses.filter(([, name]) => name !== "CC BY-SA 3.0")).toEqual([
			["J", "Public domain"],
		]);
		expect(getPhonemeRecordingSource("J")?.license.url).toBeNull();
	});
});
