import { describe, expect, it } from "vitest";
import { splitMergerNoteText } from "../../formatters/merger-note";
import { getMergerNoteRegistryForLanguage } from "../../registries/registries";

describe("merger notes", () => {
	const english = getMergerNoteRegistryForLanguage("en-us");

	it("notes cot–caught on /ɔ/ and marry–merry on /æ/ and /ɛ/, and nothing else", () => {
		expect(Object.keys(english).sort()).toEqual(["AE", "E", "O"]);
		expect(english.O?.map(({ id }) => id)).toEqual(["cot-caught"]);
		expect(english.AE?.map(({ id }) => id)).toEqual(["mary-marry-merry"]);
		expect(english.E).toEqual(english.AE);
	});

	it("has no notes for Spanish", () => {
		expect(getMergerNoteRegistryForLanguage("es-419")).toBeNull();
	});

	it("closes every word and sound it marks", () => {
		const markers = { plain: "", word: "*", sound: "/" };
		for (const note of Object.values(english).flat()) {
			// A stray marker would be dropped from the segments, so the rebuilt text would differ.
			const rebuilt = splitMergerNoteText(note.text)
				.map(({ text, kind }) => `${markers[kind]}${text}${markers[kind]}`)
				.join("");
			expect(rebuilt, note.id).toBe(note.text);
		}
	});
});
