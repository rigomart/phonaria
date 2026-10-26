import type { WordAudioManifest } from "@phonaria/phonetics-data";
import { EnglishWordAudio } from "@phonaria/phonetics-data/data/en/word-audio";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { WordAudioButton } from "./word-audio-button";

const manifest = vi.hoisted(() => ({
	current: undefined as WordAudioManifest | null | undefined,
}));
vi.mock("@/hooks/use-word-audio-manifest", () => ({
	useWordAudioManifest: () => manifest.current,
}));

function render(word: string) {
	return renderToString(
		<AudioManagerProvider>
			<WordAudioButton targetAccent="en-us" word={word} fallback={word} className="cell">
				{word} speaker
			</WordAudioButton>
		</AudioManagerProvider>,
	);
}

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
});

afterEach(() => {
	vi.unstubAllEnvs();
	manifest.current = undefined;
});

describe("WordAudioButton", () => {
	it("renders a play button for a recorded word once the manifest has loaded", () => {
		manifest.current = EnglishWordAudio;
		const html = render("seat");
		expect(html).toContain("<button");
		expect(html).toContain('aria-label="Hear seat"');
		expect(html).toContain('data-status="idle"');
		expect(html).not.toContain('aria-disabled="true"');
	});

	it("renders only the fallback for a word without a recording", () => {
		manifest.current = EnglishWordAudio;
		const html = render("zzzz");
		expect(html).toBe("zzzz");
		expect(html).not.toContain("<button");
	});

	it("renders only the fallback when the accent has no recordings or loading failed", () => {
		manifest.current = null;
		expect(render("seat")).toBe("seat");
	});

	it("holds the button's place, disabled, until the manifest has loaded", () => {
		manifest.current = EnglishWordAudio;
		const loaded = render("seat");
		manifest.current = undefined;
		const pending = render("seat");
		expect(pending).toContain('aria-disabled="true"');
		expect(pending).toContain('data-status="pending"');
		const withoutState = (html: string) =>
			html.replace(/ aria-disabled="true"| data-status="[a-z]+"/g, "");
		expect(withoutState(pending)).toBe(withoutState(loaded));
		expect(render("zzzz")).toContain('data-status="pending"');
	});
});
