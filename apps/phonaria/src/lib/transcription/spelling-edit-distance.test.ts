import { describe, expect, it } from "vitest";
import { spellingEditDistanceWithinTwo } from "./spelling-edit-distance";

describe("spellingEditDistanceWithinTwo", () => {
	it("counts insertion, removal, replacement, and adjacent swap", () => {
		expect(spellingEditDistanceWithinTwo("adress", "address")).toBe(1);
		expect(spellingEditDistanceWithinTwo("reciv", "receive")).toBe(2);
		expect(spellingEditDistanceWithinTwo("wnat", "want")).toBe(1);
		expect(spellingEditDistanceWithinTwo("abxcd", "abcd")).toBe(1);
		expect(spellingEditDistanceWithinTwo("ab", "ba")).toBe(1);
	});

	it("rejects words needing more than two edits", () => {
		expect(spellingEditDistanceWithinTwo("langwidge", "language")).toBeNull();
		expect(spellingEditDistanceWithinTwo("abcdef", "uvwxyz")).toBeNull();
		expect(spellingEditDistanceWithinTwo("abc", "abcdef")).toBeNull();
	});
});
