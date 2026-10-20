import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { promptFor } from "../_lib/minimal-pair-prompt";
import type { SpeakingView } from "../_lib/speaking-attempt";
import { FAILURE_MESSAGES, SpeakingStatus } from "./speaking-result";

function shipPrompt() {
	const prompt = promptFor("i-ix", "ship");
	if (!prompt) throw new Error("ship is a catalog word");
	return prompt;
}

function render(view: SpeakingView) {
	return renderToString(
		<AudioManagerProvider>
			<SpeakingStatus prompt={shipPrompt()} view={view} />
		</AudioManagerProvider>,
	);
}

/** Text content with tags removed and React's text separators collapsed. */
function text(html: string) {
	return html
		.replace(/<!-- -->/g, "")
		.replace(/<[^>]+>/g, "")
		.replace(/&#x27;/g, "'")
		.replace(/&quot;/g, '"');
}

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("SpeakingStatus", () => {
	it("confirms a match", () => {
		const html = render({ phase: "outcome", outcome: { verdict: "match" } });
		expect(text(html)).toBe("Your /ɪ/ sounded right. That's ship.");
		expect(html).not.toContain("<button");
	});

	it("names the heard sound and the word it makes, with a button to hear it", () => {
		const html = render({
			phase: "outcome",
			outcome: { verdict: "swapped", heard: { id: "I", ipa: "i" }, heardWord: "sheep" },
		});
		expect(text(html)).toContain("Your /ɪ/ sounded like /i/, which makes sheep.");
		expect(html).toContain('aria-label="Hear sheep"');
	});

	it("names only the heard sound when it makes no pair word", () => {
		const html = render({
			phase: "outcome",
			outcome: { verdict: "swapped", heard: { id: "E", ipa: "ɛ" }, heardWord: null },
		});
		expect(text(html)).toBe("Your /ɪ/ sounded like /ɛ/.");
		expect(html).not.toContain("<button");
	});

	it("says why it couldn't tell, never that the learner was wrong", () => {
		for (const [reason, message] of [
			["no-evidence", "Didn't catch the word. Try again a little closer to the mic."],
			["close-call", "Somewhere between /ɪ/ and /i/. Try again and make it a clear /ɪ/."],
			["other-sound", "That didn't sound clearly like /ɪ/ or /i/. Try again."],
		] as const) {
			const html = render({ phase: "outcome", outcome: { verdict: "unclear", reason } });
			expect(text(html)).toBe(message);
			expect(text(html)).not.toMatch(/wrong|mistake|incorrect/i);
		}
	});

	it("says when nothing was heard", () => {
		expect(text(render({ phase: "outcome", outcome: { verdict: "not-heard" } }))).toBe(
			"We didn't catch anything. Check your microphone and try again.",
		);
	});

	it("says what came through instead of the word, without judging a sound", () => {
		for (const [heard, message] of [
			[["the", "ship", "is"], 'We heard "the ship is". Say just ship on its own.'],
			[["ships"], "That sounded like ships, not ship. Try again with just the word."],
			[[], "That didn't sound like ship or sheep. Try again."],
		] as const) {
			const html = render({ phase: "outcome", outcome: { verdict: "different-word", heard } });
			expect(text(html)).toBe(message);
			expect(text(html)).not.toMatch(/\/[^/ ]+\//);
			expect(html).not.toContain("<button");
		}
	});

	it("never names a third sound when another sound won", () => {
		const html = render({
			phase: "outcome",
			outcome: { verdict: "unclear", reason: "other-sound" },
		});
		expect(text(html).match(/\/[^/ ]+\//g)).toEqual(["/ɪ/", "/i/"]);
	});

	it.each(Object.entries(FAILURE_MESSAGES))(
		"explains the %s failure in one line",
		(failure, message) => {
			const html = render({ phase: "failure", failure: failure as keyof typeof FAILURE_MESSAGES });
			expect(text(html)).toBe(message);
		},
	);

	it("gives each failure its own message", () => {
		expect(FAILURE_MESSAGES.unsupported).toBe(
			"Recording isn't available here. Check that a microphone is connected, or try another browser.",
		);
		expect(new Set(Object.values(FAILURE_MESSAGES)).size).toBe(5);
	});

	it("shows progress while listening and checking, and nothing before a recording", () => {
		expect(render({ phase: "ready" })).toBe("");
		expect(text(render({ phase: "recording" }))).toBe("Listening. Say ship.");
		const scoring = render({ phase: "scoring" });
		expect(text(scoring)).toBe("Checking your /ɪ/…");
		expect(scoring, "the sentence is one flex item, so the gap can't split it").toMatch(
			/<\/svg><span>Checking your .*…<\/span><\/p>$/,
		);
	});
});
