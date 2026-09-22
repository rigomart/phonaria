import { describe, expect, it } from "vitest";
import { damerauLevenshteinUpTo } from "./edit-distance-reference";
import { classifyEdits, type EditScript } from "./spelling-edits";

function shape(script: EditScript | null) {
	if (script === null) return null;
	return script.edits.map((edit) => `${edit.kind}${edit.strong ? "" : "?"}`);
}

describe("classifyEdits", () => {
	it("reports no edit script for a word identical to the token", () => {
		expect(classifyEdits("receive", "receive", 2)).toBeNull();
	});

	it("reads a supplied letter as a strong insertion", () => {
		expect(shape(classifyEdits("aardvrk", "aardvark", 2))).toEqual(["insert"]);
	});

	it("reads a dropped doubled keystroke as a strong deletion", () => {
		expect(shape(classifyEdits("zucchinni", "zucchini", 2))).toEqual(["delete"]);
	});

	it("reads a dropped single letter as a weak deletion", () => {
		expect(shape(classifyEdits("adress", "dress", 2))).toEqual(["delete?"]);
	});

	it("reads a vowel swapped for a vowel as a strong substitution", () => {
		expect(shape(classifyEdits("rhinocerus", "rhinoceros", 2))).toEqual(["substitute"]);
	});

	it("reads a consonant swapped for a consonant as a weak substitution", () => {
		expect(shape(classifyEdits("langwidge", "langridge", 2))).toEqual(["substitute?"]);
	});

	it("reads two vowels changing places as a strong transposition", () => {
		expect(shape(classifyEdits("wierdness", "weirdness", 2))).toEqual(["transpose"]);
	});

	it("reads a consonant changing places with a vowel as a weak transposition", () => {
		expect(shape(classifyEdits("definatly", "defiantly", 2))).toEqual(["transpose?"]);
	});

	it("reads two omitted letters as two strong insertions", () => {
		expect(shape(classifyEdits("acomodate", "accommodate", 2))).toEqual(["insert", "insert"]);
	});

	it("reads a vowel swap plus an omitted letter as two strong edits", () => {
		expect(shape(classifyEdits("definatly", "definitely", 2))).toEqual(["substitute", "insert"]);
	});

	it("refuses a candidate that needs more edits than the budget allows", () => {
		expect(classifyEdits("fone", "phone", 1)).toBeNull();
		// Two readings cost the same; the strongest-first one wins.
		expect(shape(classifyEdits("fone", "phone", 2))).toEqual(["insert", "substitute?"]);
	});

	it("refuses a candidate beyond two edits", () => {
		expect(classifyEdits("zxqvwoplmj", "receive", 2)).toBeNull();
	});

	it("reports the shortest script when a longer one also reaches the word", () => {
		// `teh` → `the` is one transposition, never a substitution plus an insertion.
		expect(shape(classifyEdits("teh", "the", 2))).toEqual(["transpose?"]);
	});

	it("reads the most charitable script when two of the same length reach the word", () => {
		// `recieve` → `receive` is a vowel transposition, not two consonant substitutions.
		expect(shape(classifyEdits("recieve", "receive", 2))).toEqual(["transpose"]);
	});

	it("counts a doubled letter as doubled from either side", () => {
		expect(shape(classifyEdits("recceive", "receive", 2))).toEqual(["delete"]);
		expect(shape(classifyEdits("committee", "commitee", 2))).toEqual(["delete"]);
	});

	it("ignores letter case on both sides", () => {
		expect(shape(classifyEdits("Aardvrk", "aardvark", 2))).toEqual(["insert"]);
	});

	it("handles an empty token", () => {
		expect(classifyEdits("", "the", 2)).toBeNull();
	});
});

describe("classifyEdits against a reference distance", () => {
	function* randomPairs(count: number) {
		let seed = 424242;
		const random = () => {
			seed = (seed * 1664525 + 1013904223) % 4294967296;
			return seed / 4294967296;
		};
		const letters = [..."abcdeilmnorstuv"];
		const word = () =>
			Array.from({ length: 3 + Math.floor(random() * 7) }, () => {
				const letter = letters[Math.floor(random() * letters.length)];
				return letter ?? "a";
			}).join("");

		for (let index = 0; index < count; index += 1) {
			const left = word();
			// Half the pairs are near-misses, so the budget is exercised on both sides.
			const right = random() < 0.5 ? word() : mutate(left, random);
			yield [left, right] as const;
		}
	}

	function mutate(word: string, random: () => number): string {
		let result = word;
		const rounds = 1 + Math.floor(random() * 3);
		for (let round = 0; round < rounds; round += 1) {
			const index = Math.floor(random() * result.length);
			result = result.slice(0, index) + result.slice(index + 1);
		}
		return result;
	}

	it("finds a script exactly when the real distance is within budget", () => {
		const disagreements: string[] = [];
		for (const [token, candidate] of randomPairs(4_000)) {
			if (token === candidate || token.length === 0) continue;
			const distance = damerauLevenshteinUpTo(token, candidate, 2);
			const script = classifyEdits(token, candidate, 2);
			const found = script === null ? null : script.edits.length;
			if (distance <= 2 ? found !== distance : found !== null) {
				disagreements.push(`${token}→${candidate}: distance ${distance}, script ${found}`);
			}
		}

		expect(disagreements.slice(0, 10)).toEqual([]);
	});
});
