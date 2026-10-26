import type { WordAudioManifest } from "@phonaria/phonetics-data";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { WordAudioButton } from "./word-audio-button";
import { WordAudioForms } from "./word-audio-forms";

/** The top-10k batches add forms like these; no form clip is published yet. */
const withForms: WordAudioManifest = {
	voice: "jenny",
	words: ["either", "read", "seat"],
	forms: {
		either: [
			{ pronunciation: "I1 DH ER0" },
			{ n: 2, label: "also said", pronunciation: "AI1 DH ER0" },
		],
		read: [
			{ label: "present tense", pronunciation: "R I1 D" },
			{ n: 2, label: "past tense", pronunciation: "R E1 D" },
		],
	},
};

const manifest = vi.hoisted(() => ({
	current: undefined as WordAudioManifest | null | undefined,
}));
vi.mock("@/hooks/use-word-audio-manifest", () => ({
	useWordAudioManifest: () => manifest.current,
}));

const render = (node: React.ReactNode) =>
	renderToString(<AudioManagerProvider>{node}</AudioManagerProvider>);

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
	manifest.current = withForms;
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("WordAudioForms", () => {
	it("shows one button per form, its label visible and in the accessible name", () => {
		const html = render(<WordAudioForms targetAccent="en-us" word="read" />);
		expect(html.match(/<button/g)).toHaveLength(2);
		expect(html).toContain('aria-label="Hear read, present tense"');
		expect(html).toContain('aria-label="Hear read, past tense"');
		expect(html).toContain("present tense</button>");
		expect(html).toContain("past tense</button>");
	});

	it("puts the form of a given pronunciation first, and keeps the main form first otherwise", () => {
		const order = (pronunciation?: string) =>
			[
				...render(
					<WordAudioForms targetAccent="en-us" word="read" pronunciation={pronunciation} />,
				).matchAll(/aria-label="Hear read, ([^"]*)"/g),
			].map(([, label]) => label);
		expect(order("R E1 D")).toEqual(["past tense", "present tense"]);
		expect(order("R I1 D")).toEqual(["present tense", "past tense"]);
		expect(order("R AX0 D")).toEqual(["present tense", "past tense"]);
		expect(order()).toEqual(["present tense", "past tense"]);
	});

	it("keeps the main form first when unstressed vowels make two forms alike", () => {
		manifest.current = {
			voice: "jenny",
			words: ["but"],
			forms: {
				but: [
					{ label: "stressed", pronunciation: "B AH1 T" },
					{ n: 2, label: "weak", pronunciation: "B AX0 T" },
					{ n: 3, label: "weaker", pronunciation: "B IX0 T" },
				],
			},
		};
		const order = (pronunciation: string) =>
			[
				...render(
					<WordAudioForms targetAccent="en-us" word="but" pronunciation={pronunciation} />,
				).matchAll(/aria-label="Hear but, ([^"]*)"/g),
			].map(([, label]) => label);
		expect(order("B IX0 T")).toEqual(["weaker", "stressed", "weak"]);
		expect(order("B OU0 T")).toEqual(["stressed", "weak", "weaker"]);
	});

	it("shows the word on a main form without a label", () => {
		const html = render(<WordAudioForms targetAccent="en-us" word="either" />);
		expect(html).toContain('aria-label="Hear either"');
		expect(html).toContain("either</button>");
		expect(html).toContain('aria-label="Hear either, also said"');
	});

	it("shows one button for a word recorded once, and nothing without a recording", () => {
		expect(
			render(<WordAudioForms targetAccent="en-us" word="seat" />).match(/<button/g),
		).toHaveLength(1);
		expect(render(<WordAudioForms targetAccent="en-us" word="zzzz" />)).toBe("");
	});

	it("shows one disabled button for the word until the manifest has loaded", () => {
		manifest.current = undefined;
		const html = render(<WordAudioForms targetAccent="en-us" word="read" />);
		expect(html.match(/<button/g)).toHaveLength(1);
		expect(html).toContain('aria-label="Hear read"');
		expect(html).toContain('aria-disabled="true"');
	});
});

describe("single-word surfaces", () => {
	it("play only a word's main form", () => {
		const html = render(<WordAudioButton targetAccent="en-us" word="read" />);
		expect(html.match(/<button/g)).toHaveLength(1);
		expect(html).toContain('aria-label="Hear read"');
		expect(html).not.toContain("tense");
	});
});
