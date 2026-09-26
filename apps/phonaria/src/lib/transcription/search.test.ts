import { defaultParseSearch, defaultStringifySearch } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import {
	isSuppressedTranscriptionQuery,
	normalizeTranscriptionQuery,
	resetTranscriptionQuerySuppression,
	resolveTranscriptionSearchSync,
	shouldShowTranscriptionEmptyState,
	suppressActiveTranscriptionQuery,
	TRANSCRIPTION_INPUT_MAX_LENGTH,
	validateTranscriptionSearch,
} from "./search";

afterEach(() => {
	resetTranscriptionQuerySuppression();
});

describe("validateTranscriptionSearch", () => {
	it("trims, and treats empty text as missing", () => {
		expect(validateTranscriptionSearch({ q: "  hello world  " })).toEqual({ q: "hello world" });
		expect(validateTranscriptionSearch({ q: "   " }).q).toBeUndefined();
		expect(validateTranscriptionSearch({ q: "" }).q).toBeUndefined();
		expect(validateTranscriptionSearch({}).q).toBeUndefined();
		expect(validateTranscriptionSearch({ q: null }).q).toBeUndefined();
		expect("q" in validateTranscriptionSearch({ q: "   " })).toBe(true);
	});

	it("cuts text down to the input limit instead of rejecting it", () => {
		const text = `  ${"a".repeat(TRANSCRIPTION_INPUT_MAX_LENGTH + 40)}`;
		expect(validateTranscriptionSearch({ q: text }).q).toBe(
			"a".repeat(TRANSCRIPTION_INPUT_MAX_LENGTH),
		);
		expect(
			normalizeTranscriptionQuery("a".repeat(TRANSCRIPTION_INPUT_MAX_LENGTH + 1)),
		).toHaveLength(TRANSCRIPTION_INPUT_MAX_LENGTH);
	});

	it("turns router-parsed numbers and booleans back into strings", () => {
		expect(validateTranscriptionSearch(defaultParseSearch("?q=42"))).toEqual({ q: "42" });
		expect(validateTranscriptionSearch(defaultParseSearch("?q=0"))).toEqual({ q: "0" });
		expect(validateTranscriptionSearch(defaultParseSearch("?q=true"))).toEqual({ q: "true" });
		expect(validateTranscriptionSearch(defaultParseSearch("?q=false"))).toEqual({ q: "false" });
		expect(validateTranscriptionSearch({ q: 42 })).toEqual({ q: "42" });
		expect(validateTranscriptionSearch({ q: true })).toEqual({ q: "true" });
	});

	it("reads a shared phrase from ?q=hello+world", () => {
		expect(defaultStringifySearch({ q: "hello world" })).toBe("?q=hello+world");
		expect(validateTranscriptionSearch(defaultParseSearch("?q=hello+world"))).toEqual({
			q: "hello world",
		});
		expect(validateTranscriptionSearch(defaultParseSearch("?q=%20hello%20"))).toEqual({
			q: "hello",
		});
		expect(validateTranscriptionSearch(defaultParseSearch("?q=")).q).toBeUndefined();
		expect(validateTranscriptionSearch(defaultParseSearch("?q=+++")).q).toBeUndefined();
	});
});

describe("resolveTranscriptionSearchSync", () => {
	it("does not run again when q already matches the submitted text", () => {
		expect(
			resolveTranscriptionSearchSync({ q: "hello", lastText: "hello", resultShowing: true }),
		).toEqual({ type: "none" });
		expect(
			resolveTranscriptionSearchSync({ q: "hello", lastText: "hello", resultShowing: false }),
		).toEqual({ type: "none" });
	});

	it("looks the text up again when the query returns and the result is gone", () => {
		expect(
			resolveTranscriptionSearchSync({
				q: "hello",
				lastText: "hello",
				resultShowing: false,
				draftText: "!!!",
			}),
		).toEqual({ type: "transcribe", text: "hello" });
		expect(
			resolveTranscriptionSearchSync({
				q: "hello",
				lastText: "hello",
				resultShowing: false,
				draftText: "hello",
			}),
		).toEqual({ type: "transcribe", text: "hello" });
		expect(
			resolveTranscriptionSearchSync({
				q: "hello",
				lastText: "hello",
				resultShowing: true,
				draftText: "hello",
			}),
		).toEqual({ type: "none" });
	});

	it("fills and transcribes when q differs from the submitted text", () => {
		expect(
			resolveTranscriptionSearchSync({ q: "hello", lastText: null, resultShowing: false }),
		).toEqual({ type: "transcribe", text: "hello" });
		expect(
			resolveTranscriptionSearchSync({ q: "world", lastText: "hello", resultShowing: true }),
		).toEqual({ type: "transcribe", text: "world" });
	});

	it("clears when q is missing and a transcription is showing or remembered", () => {
		expect(
			resolveTranscriptionSearchSync({ q: undefined, lastText: "hello", resultShowing: true }),
		).toEqual({ type: "clear" });
		expect(
			resolveTranscriptionSearchSync({ q: undefined, lastText: "hello", resultShowing: false }),
		).toEqual({ type: "clear" });
		expect(
			resolveTranscriptionSearchSync({ q: undefined, lastText: null, resultShowing: false }),
		).toEqual({ type: "none" });
	});

	it("restores the submitted text when the draft drifted and the query is unchanged", () => {
		expect(
			resolveTranscriptionSearchSync({
				q: "hello",
				lastText: "hello",
				resultShowing: true,
				draftText: "world",
			}),
		).toEqual({ type: "restore-draft", text: "hello" });
		expect(
			resolveTranscriptionSearchSync({
				q: "hello",
				lastText: "hello",
				resultShowing: true,
				draftText: "hello",
			}),
		).toEqual({ type: "none" });
		expect(
			resolveTranscriptionSearchSync({
				q: "hello",
				lastText: "hello",
				resultShowing: true,
			}),
		).toEqual({ type: "none" });
	});

	it("clears a draft that never became a transcription when q is removed", () => {
		expect(
			resolveTranscriptionSearchSync({
				q: undefined,
				lastText: null,
				resultShowing: false,
				draftText: "!!!",
			}),
		).toEqual({ type: "clear" });
		expect(
			resolveTranscriptionSearchSync({
				q: "!!!",
				lastText: null,
				resultShowing: false,
				draftText: "",
			}),
		).toEqual({ type: "transcribe", text: "!!!" });
		expect(
			resolveTranscriptionSearchSync({
				q: undefined,
				lastText: null,
				resultShowing: false,
				draftText: "",
			}),
		).toEqual({ type: "none" });
	});
});

describe("shouldShowTranscriptionEmptyState", () => {
	it("hides examples while a query is waiting and nothing has settled", () => {
		expect(
			shouldShowTranscriptionEmptyState({ q: "hello", hasResult: false, hasError: false }),
		).toBe(false);
	});

	it("shows examples only when the query is missing and the screen is empty", () => {
		expect(
			shouldShowTranscriptionEmptyState({ q: undefined, hasResult: false, hasError: false }),
		).toBe(true);
		expect(
			shouldShowTranscriptionEmptyState({ q: undefined, hasResult: true, hasError: false }),
		).toBe(false);
		expect(
			shouldShowTranscriptionEmptyState({ q: undefined, hasResult: false, hasError: true }),
		).toBe(false);
	});
});

describe("transcription query suppression", () => {
	it("ignores the query Clear just left until the URL moves on", () => {
		suppressActiveTranscriptionQuery("hello");
		expect(isSuppressedTranscriptionQuery("hello")).toBe(true);
		expect(isSuppressedTranscriptionQuery("hello")).toBe(true);
		expect(isSuppressedTranscriptionQuery(undefined)).toBe(false);
		expect(isSuppressedTranscriptionQuery("hello")).toBe(false);
	});
});
