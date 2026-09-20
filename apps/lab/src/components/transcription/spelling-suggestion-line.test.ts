import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { SpellingSuggestion } from "@/lib/transcription/spelling-suggestion";
import { SpellingSuggestionLineControl } from "./spelling-suggestion-line";

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
