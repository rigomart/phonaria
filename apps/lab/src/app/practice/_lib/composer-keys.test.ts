import { describe, expect, it } from "vitest";
import { type ComposerKeyState, resolveComposerKey } from "./composer-keys";

function state(overrides: Partial<ComposerKeyState> = {}): ComposerKeyState {
	return { query: "", matchCount: 0, highlight: 0, ...overrides };
}

describe("resolveComposerKey", () => {
	it("commits the highlighted match on Enter", () => {
		expect(
			resolveComposerKey("Enter", state({ query: "sch", matchCount: 3, highlight: 1 })),
		).toEqual({ type: "commit", index: 1 });
	});

	it("ignores Enter when nothing is highlighted", () => {
		expect(resolveComposerKey("Enter", state({ query: "qqq", matchCount: 0 }))).toEqual({
			type: "none",
		});
	});

	it("moves the highlight down and clamps at the last match", () => {
		expect(resolveComposerKey("ArrowDown", state({ matchCount: 3, highlight: 0 }))).toEqual({
			type: "highlight",
			index: 1,
		});
		expect(resolveComposerKey("ArrowDown", state({ matchCount: 3, highlight: 2 }))).toEqual({
			type: "highlight",
			index: 2,
		});
	});

	it("moves the highlight up and clamps at the first match", () => {
		expect(resolveComposerKey("ArrowUp", state({ matchCount: 3, highlight: 2 }))).toEqual({
			type: "highlight",
			index: 1,
		});
		expect(resolveComposerKey("ArrowUp", state({ matchCount: 3, highlight: 0 }))).toEqual({
			type: "highlight",
			index: 0,
		});
	});

	it("ignores the arrows when there are no matches", () => {
		expect(resolveComposerKey("ArrowDown", state())).toEqual({ type: "none" });
		expect(resolveComposerKey("ArrowUp", state())).toEqual({ type: "none" });
	});

	it("clears the query on Escape", () => {
		expect(resolveComposerKey("Escape", state({ query: "sch", matchCount: 2 }))).toEqual({
			type: "clear-query",
		});
	});

	it("does nothing on Escape with an empty query, leaving the event to the page", () => {
		expect(resolveComposerKey("Escape", state())).toEqual({ type: "none" });
	});

	it("removes the last sound on Backspace only when the query is empty", () => {
		expect(resolveComposerKey("Backspace", state())).toEqual({ type: "remove-last" });
		expect(resolveComposerKey("Backspace", state({ query: "s" }))).toEqual({ type: "none" });
	});

	it("leaves every other key to the input", () => {
		expect(resolveComposerKey("a", state({ query: "s", matchCount: 2 }))).toEqual({ type: "none" });
		expect(resolveComposerKey("Tab", state({ matchCount: 2 }))).toEqual({ type: "none" });
	});
});
