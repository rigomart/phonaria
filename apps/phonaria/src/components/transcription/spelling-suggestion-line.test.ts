import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { SpellingSuggestion } from "@/lib/transcription/spelling-suggestion";
import { SpellingSuggestionLineControl, SpellingSuggestionSlot } from "./spelling-suggestion-line";

const suggestion: SpellingSuggestion = {
	suggestedText: "hello receive",
	underlinedTokenIndexes: [1],
	segments: [
		{ text: "hello ", underlined: false },
		{ text: "receive", underlined: true },
	],
};

describe("SpellingSuggestionLineControl", () => {
	it("renders the full phrase as one control with only offered words underlined", () => {
		const html = renderToStaticMarkup(
			createElement(SpellingSuggestionLineControl, { suggestion, onAccept: () => {} }),
		);

		expect(html).toContain("Did you mean ");
		expect(html).toContain("hello ");
		expect(html).toContain("receive");
		expect(html).toMatch(/<button[^>]*type="button"/);
		expect(html).toContain("underline");
	});

	it("activates once for the whole line", () => {
		const onAccept = vi.fn();
		const html = renderToStaticMarkup(
			createElement(SpellingSuggestionLineControl, { suggestion, onAccept }),
		);
		expect(html.match(/<button/g)).toHaveLength(1);
	});
});

describe("SpellingSuggestionSlot", () => {
	it("stays mounted as a live region with nothing to offer, taking no line of its own", () => {
		const html = renderToStaticMarkup(
			createElement(SpellingSuggestionSlot, { suggestion: null, onAccept: () => {} }),
		);

		expect(html).toContain('aria-live="polite"');
		expect(html).toContain("flex-1");
		expect(html).not.toContain("min-h-");
		expect(html).not.toContain("<button");
	});

	it("fades the offer in", () => {
		const html = renderToStaticMarkup(
			createElement(SpellingSuggestionSlot, { suggestion, onAccept: () => {} }),
		);

		expect(html).toMatch(/animate-in[^"]*fade-in/);
		expect(html).toContain("motion-reduce:animate-none");
		expect(html).toContain("Did you mean ");
	});
});
