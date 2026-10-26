import { getWordAudioPath } from "@phonaria/phonetics-data";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WordAudio } from "./word-audio";

const BUCKET = "https://assets.example";
const play = vi.fn();
const useAudioManager = vi.fn((_src: string) => ({ play, status: "idle", isActive: false }));
const speech = vi.fn();

vi.mock("@/hooks/use-audio-manager", () => ({
	useAudioManager: (src: string) => useAudioManager(src),
}));

/** Resolves the shared button WordAudio renders; hooks are mocked, so it can be called directly. */
function resolveButton(word: string) {
	let element = WordAudio({ word }) as ReactElement<Record<string, unknown>> | null;
	while (element && typeof element.type === "function") {
		const Component = element.type as (props: Record<string, unknown>) => ReactElement | null;
		element = Component(element.props) as ReactElement<Record<string, unknown>> | null;
	}
	if (!element) throw new Error(`no button rendered for ${word}`);
	return element as ReactElement<{ onClick: () => void }>;
}

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", BUCKET);
	vi.stubGlobal("speechSynthesis", { speak: speech, cancel: speech });
	vi.stubGlobal("SpeechSynthesisUtterance", speech);
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe("WordAudio", () => {
	it("renders a labelled play button for a recorded word", () => {
		const html = renderToString(<WordAudio word="adapt" />);
		expect(html).toContain("<button");
		expect(html).toContain('aria-label="Hear adapt"');
		expect(html).toContain('aria-hidden="true"');
	});

	it("plays the word's recording through the shared player on click", () => {
		const path = getWordAudioPath("en-us", "adapt");
		expect(path).not.toBeNull();

		const button = resolveButton("adapt");
		expect(useAudioManager).toHaveBeenCalledWith(`${BUCKET}/${path}`);

		button.props.onClick();
		expect(play).toHaveBeenCalledTimes(1);
	});

	it("renders no button for a word without a recording", () => {
		expect(getWordAudioPath("en-us", "zzzz")).toBeNull();
		expect(renderToString(<WordAudio word="zzzz" />)).toBe("");
	});

	it("never uses speech synthesis", () => {
		const button = resolveButton("adapt");
		button.props.onClick();
		renderToString(<WordAudio word="adapt" />);
		renderToString(<WordAudio word="zzzz" />);
		expect(speech).not.toHaveBeenCalled();
	});
});
