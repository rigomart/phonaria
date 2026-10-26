import type { WordAudioManifest } from "@phonaria/phonetics-data";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { WordAudioButton } from "./word-audio-button";
import { WordAudioForms } from "./word-audio-forms";

/** The top-10k batches add forms like these; no form clip is published yet. */
const manifest: WordAudioManifest = {
	voice: "jenny",
	words: ["either", "read", "seat"],
	forms: {
		either: [{ n: 2, label: "also said" }],
		read: [{ label: "present tense" }, { n: 2, label: "past tense" }],
	},
};

vi.mock("@phonaria/phonetics-data", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@phonaria/phonetics-data")>();
	return {
		...actual,
		getWordAudioPath: (accent: "en-us", word: string) =>
			actual.findWordAudioPath(manifest, accent, word),
		getWordAudioForms: (accent: "en-us", word: string) =>
			actual.findWordAudioForms(manifest, accent, word),
	};
});

const render = (node: React.ReactNode) =>
	renderToString(<AudioManagerProvider>{node}</AudioManagerProvider>);

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
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
});

describe("single-word surfaces", () => {
	it("play only a word's main form", () => {
		const html = render(<WordAudioButton targetAccent="en-us" word="read" />);
		expect(html.match(/<button/g)).toHaveLength(1);
		expect(html).toContain('aria-label="Hear read"');
		expect(html).not.toContain("tense");
	});
});
