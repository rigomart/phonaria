import { describe, expect, it } from "vitest";
import { syllabify } from "./syllabifier";

// Tests use phoneme ID format (H, AX, OU) not ARPABET (HH, AH, OW)
describe("Syllabifier", () => {
	it("syllabifies simple CVC words correctly", () => {
		// cat: K AE1 T
		const tokens = ["K", "AE1", "T"];
		const syllables = syllabify(tokens);

		expect(syllables).toHaveLength(1);
		expect(syllables[0].phonemes.map((p) => p.cmuToken)).toEqual(["K", "AE1", "T"]);
		expect(syllables[0].stress).toBe("primary");
	});

	it("syllabifies VCV words using Maximum Onset Principle", () => {
		// lemon: L E1 M AX0 N (phoneme IDs with stress)
		// M is onset of second syllable
		const tokens = ["L", "E1", "M", "AX0", "N"];
		const syllables = syllabify(tokens);

		expect(syllables).toHaveLength(2);
		// Syllable 1: L E1
		expect(syllables[0].phonemes.map((p) => p.cmuToken)).toEqual(["L", "E1"]);
		expect(syllables[0].stress).toBe("primary");
		// Syllable 2: M AX0 N
		expect(syllables[1].phonemes.map((p) => p.cmuToken)).toEqual(["M", "AX0", "N"]);
		expect(syllables[1].stress).toBe("none");
	});

	it("syllabifies words with clusters respecting valid onsets", () => {
		// problem: P R A1 B L AX0 M (phoneme IDs)
		// bl is a valid onset, so pro.blem?
		// MOP: maximize onset of syllable 2.
		// Intervocalic: B L
		// Valid onsets in B L: "B L" (yes), "L" (yes). Longest is "B L".
		// So split before B. -> P R A1 . B L AX0 M
		const tokens = ["P", "R", "A1", "B", "L", "AX0", "M"];
		const syllables = syllabify(tokens);

		expect(syllables).toHaveLength(2);
		expect(syllables[0].phonemes.map((p) => p.cmuToken)).toEqual(["P", "R", "A1"]);
		expect(syllables[1].phonemes.map((p) => p.cmuToken)).toEqual(["B", "L", "AX0", "M"]);
	});

	it("syllabifies words with clusters where full cluster is NOT valid onset", () => {
		// master: M AE1 S T ER0
		// st is valid onset. -> ma.ster
		const tokens = ["M", "AE1", "S", "T", "ER0"];
		const syllables = syllabify(tokens);

		expect(syllables).toHaveLength(2);
		expect(syllables[0].phonemes.map((p) => p.cmuToken)).toEqual(["M", "AE1"]);
		expect(syllables[1].phonemes.map((p) => p.cmuToken)).toEqual(["S", "T", "ER0"]);
	});

	it("syllabifies construct correctly", () => {
		// construct: K AX0 N S T R AH1 K T (phoneme IDs)
		// Intervocalic 1 (AX0 - AH1): N S T R
		// Valid onsets in N S T R:
		// "N S T R" (no)
		// "S T R" (yes) -> Split before S.
		// Syllable 1: K AX0 N
		// Syllable 2: S T R AH1 K T
		const tokens = ["K", "AX0", "N", "S", "T", "R", "AH1", "K", "T"];
		const syllables = syllabify(tokens);

		expect(syllables).toHaveLength(2);
		expect(syllables[0].phonemes.map((p) => p.cmuToken)).toEqual(["K", "AX0", "N"]);
		expect(syllables[1].phonemes.map((p) => p.cmuToken)).toEqual(["S", "T", "R", "AH1", "K", "T"]);
	});

	it("handles words with no vowels", () => {
		// hmm: H M (phoneme IDs, H not HH)
		const tokens = ["H", "M"];
		const syllables = syllabify(tokens);

		expect(syllables).toHaveLength(1);
		expect(syllables[0].phonemes.map((p) => p.cmuToken)).toEqual(["H", "M"]);
		expect(syllables[0].stress).toBe("none");
	});
});
