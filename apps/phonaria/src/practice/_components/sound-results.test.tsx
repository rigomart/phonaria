import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PhonemeDetailsContext } from "@/components/phoneme-details/context";
import { promptFor } from "../_lib/minimal-pair-prompt";
import type { SoundResult, SpeakingView } from "../_lib/speaking-attempt";
import { SoundResults } from "./sound-results";

function sleepPrompt() {
	const prompt = promptFor("i-ix", "sleep");
	if (!prompt) throw new Error("sleep is a catalog word");
	return prompt;
}

const DETAILS = {
	wide: true,
	panelTriggerId: null,
	activeTriggerId: null,
	openPanel: () => {},
	closePanel: () => {},
	releaseTrigger: () => {},
};

function render(view: SpeakingView) {
	return renderToString(
		<PhonemeDetailsContext value={DETAILS}>
			<SoundResults prompt={sleepPrompt()} view={view} />
		</PhonemeDetailsContext>,
	);
}

function text(html: string) {
	return html
		.replace(/<!-- -->/g, "")
		.replace(/<[^>]+>/g, "")
		.replace(/&#x27;/g, "'");
}

const MIXED: SoundResult[] = [
	{ position: 0, sound: { id: "S", ipa: "s" }, verdict: { type: "match" } },
	{
		position: 1,
		sound: { id: "L", ipa: "l" },
		verdict: { type: "unclear", reason: "other-sound" },
	},
	{
		position: 2,
		sound: { id: "I", ipa: "i" },
		verdict: { type: "swapped", heard: { id: "IX", ipa: "ɪ" }, heardWord: "slip" },
	},
	{
		position: 3,
		sound: { id: "P", ipa: "p" },
		verdict: { type: "swapped", heard: { id: "K", ipa: "k" }, heardWord: "sleek" },
	},
];

const mixedView: SpeakingView = {
	phase: "outcome",
	outcome: { verdict: "swapped", heard: { id: "IX", ipa: "ɪ" }, heardWord: "slip", sounds: MIXED },
};

function tiles(html: string) {
	return html.match(/<li[^>]*>.*?<\/li>/g) ?? [];
}

describe("SoundResults", () => {
	it("shows every sound in word order with its verdict in words", () => {
		const html = render(mixedView);
		const items = tiles(html);
		expect(items.map((item) => item.match(/data-sound-result="(\w+)"/)?.[1])).toEqual([
			"match",
			"unclear",
			"swapped",
			"swapped",
		]);
		const sentences = [
			"/s/ sounded right",
			"/l/ wasn't clear",
			"/i/ sounded like /ɪ/",
			"/p/ sounded like /k/",
		];
		items.forEach((item, index) => expect(text(item)).toContain(sentences[index]));
	});

	it("names the sound in every sentence for screen readers, beside its glyph", () => {
		for (const item of tiles(render(mixedView))) {
			expect(item).toMatch(
				/<span class="sr-only"><span class="font-display">\/[^/]+\/<\/span> <\/span>/,
			);
		}
	});

	it("gives a swapped sound the heard sound next to it, each with its own sound card trigger", () => {
		const html = render(mixedView);
		const labels = [...html.matchAll(/aria-label="([^"]+)"/g)].map(([, label]) => label);
		expect(labels).toEqual([
			"Details for /s/",
			"Details for /l/",
			"Details for /i/, the marked sound",
			"Details for /ɪ/",
			"Details for /p/",
			"Details for /k/",
		]);
		const [, , swapped] = tiles(html);
		expect(swapped).toMatch(/Details for \/i\/.*<svg[^>]*aria-hidden="true".*Details for \/ɪ\//);
	});

	it("draws an unclear sound as a neutral note and never words a verdict as a mistake", () => {
		const html = render(mixedView);
		const [, unclear] = tiles(html);
		expect(unclear).toContain("border-border bg-muted");
		expect(html).not.toMatch(/destructive/);
		expect(text(html)).not.toMatch(/wrong|mistake|incorrect/i);
	});

	it("names the word another swapped sound makes, leaving the contrast sound's to the result", () => {
		const html = render(mixedView);
		expect(text(html)).toContain("Your /p/ sounded like /k/, which makes sleek.");
		expect(text(html)).not.toContain("which makes slip");
	});

	it("shows nothing without judged sounds", () => {
		for (const view of [
			{ phase: "scoring" },
			{ phase: "outcome", outcome: { verdict: "not-heard" } },
			{ phase: "outcome", outcome: { verdict: "different-word", heard: ["kid"] } },
			{ phase: "outcome", outcome: { verdict: "unclear", reason: "no-evidence", sounds: [] } },
		] satisfies SpeakingView[]) {
			expect(render(view)).toBe("");
		}
	});
});
