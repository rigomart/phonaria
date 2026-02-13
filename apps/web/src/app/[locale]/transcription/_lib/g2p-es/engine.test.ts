import { describe, expect, it } from "vitest";
import { transcribeSpanishText, transcribeSpanishWord } from "./engine";

function wordIpa(word: string): string {
	const result = transcribeSpanishWord(word);
	const variant = result.variants[0];
	return variant
		.map((syl) => {
			const prefix = syl.stress === "primary" ? "\u02c8" : "";
			return prefix + syl.phonemes.map((p) => ("ipa" in p ? p.ipa : p.cmuToken)).join("");
		})
		.join(".");
}

function wordStress(word: string): string[] {
	const result = transcribeSpanishWord(word);
	return result.variants[0].map((syl) => syl.stress);
}

describe("transcribeSpanishWord", () => {
	it("transcribes hola", () => {
		expect(wordIpa("hola")).toBe("\u02c8o.la");
		// "hola": stress on penultimate (first of 2 syllables)
		expect(wordStress("hola")).toEqual(["primary", "none"]);
	});

	it("transcribes español", () => {
		expect(wordIpa("español")).toBe("es.pa.\u02c8\u0272ol");
	});

	it("transcribes guitarra", () => {
		// G="ɡ" (U+0261), RR="r"
		expect(wordIpa("guitarra")).toBe("\u0261i.\u02c8ta.ra");
	});

	it("transcribes cerveza", () => {
		// RX="ɾ" (U+027E)
		expect(wordIpa("cerveza")).toBe("se\u027e.\u02c8be.sa");
	});

	it("transcribes gracias", () => {
		// G="ɡ" (U+0261), RX="ɾ" (U+027E)
		expect(wordIpa("gracias")).toBe("\u02c8\u0261\u027ea.sias");
	});

	it("transcribes lluvia", () => {
		// YH="ʝ" (U+029D), U="u"
		expect(wordIpa("lluvia")).toBe("\u02c8\u029du.bia");
	});

	it("transcribes niño", () => {
		// N="n", NY="ɲ" (U+0272)
		expect(wordIpa("niño")).toBe("\u02c8ni.\u0272o");
	});

	it("transcribes pingüino", () => {
		// G="ɡ" (U+0261)
		expect(wordIpa("pingüino")).toBe("pin.\u02c8\u0261wi.no");
	});

	it("sets source to rules", () => {
		const result = transcribeSpanishWord("hola");
		expect(result.source).toBe("rules");
	});

	it("has exactly one variant per word", () => {
		const result = transcribeSpanishWord("casa");
		expect(result.variants).toHaveLength(1);
	});
});

describe("transcribeSpanishText", () => {
	it("transcribes multi-word text", () => {
		const result = transcribeSpanishText("hola mundo");
		expect(result.words).toHaveLength(2);
		expect(result.words[0].word).toBe("hola");
		expect(result.words[1].word).toBe("mundo");
	});

	it("handles punctuation in text", () => {
		const result = transcribeSpanishText("¿Cómo estás?");
		expect(result.words).toHaveLength(2);
		expect(result.words[0].word).toBe("cómo");
		expect(result.words[1].word).toBe("estás");
	});

	it("returns empty words for empty input", () => {
		const result = transcribeSpanishText("");
		expect(result.words).toHaveLength(0);
	});

	it("handles inverted punctuation", () => {
		const result = transcribeSpanishText("¡Hola!");
		expect(result.words).toHaveLength(1);
		expect(result.words[0].word).toBe("hola");
	});
});
