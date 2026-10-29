import type { LanguagePhonemeId, TargetAccent, WordAudioManifest } from "@phonaria/phonetics-data";
import { EnglishWordAudio } from "@phonaria/phonetics-data/data/en/word-audio";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { DetailSections, getDetailSections } from "./phoneme-details/sections";
import { describeSound, type PhonemeDetailsOptions } from "./phoneme-details/sound";
import { SoundHeader } from "./phoneme-details/sound-header";
import { SYNTHETIC_VOICE_NOTE, SyntheticVoiceNote } from "./synthetic-voice-note";

const manifest = vi.hoisted(() => ({
	current: undefined as WordAudioManifest | null | undefined,
}));
vi.mock("@/hooks/use-word-audio-manifest", () => ({
	useWordAudioManifest: () => manifest.current,
}));

const render = (node: ReactNode) =>
	renderToString(<AudioManagerProvider>{node}</AudioManagerProvider>);

const note = (words: readonly string[]) =>
	render(<SyntheticVoiceNote targetAccent="en-us" words={words} />);

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
	// Link needs a router; keep the practice links off.
	vi.stubEnv("FLAG_SPEECH", "0");
	manifest.current = EnglishWordAudio;
});

afterEach(() => {
	vi.unstubAllEnvs();
	manifest.current = undefined;
});

describe("SyntheticVoiceNote", () => {
	it("says the voice is computer-generated when one of the words has a recording", () => {
		expect(SYNTHETIC_VOICE_NOTE).toContain("computer-generated");
		expect(note(["zzzz", "seat"])).toContain(SYNTHETIC_VOICE_NOTE);
	});

	it("stays out when none of the words has a recording", () => {
		expect(note(["zzzz"])).toBe("");
		expect(note([])).toBe("");
	});

	it("stays out while the manifest loads, and when the accent has no recordings", () => {
		manifest.current = undefined;
		expect(note(["seat"])).toBe("");
		manifest.current = null;
		expect(note(["seat"])).toBe("");
	});

	it("stays out when recordings have nowhere to play from", () => {
		vi.stubEnv("PUBLIC_BUCKET_URL", "");
		expect(note(["seat"])).toBe("");
	});
});

describe("the synthetic-voice note in the sound details", () => {
	const sections = (options: Partial<PhonemeDetailsOptions> = {}) =>
		render(
			<DetailSections
				targetAccent="en-us"
				sections={getDetailSections({
					targetAccent: "en-us",
					phonemeId: "I" as LanguagePhonemeId<TargetAccent>,
					showChartLink: false,
					...options,
				})}
			/>,
		);

	it("closes the full view once, when its minimal pairs and spellings play", () => {
		expect(sections().split(SYNTHETIC_VOICE_NOTE)).toHaveLength(2);
	});

	it("stays out of a full view without words to play, like Practice's", () => {
		expect(sections({ showComparisons: false, showSpellings: false })).not.toContain(
			SYNTHETIC_VOICE_NOTE,
		);
	});

	it("follows the example word on the compact level", () => {
		const header = (showExample: boolean, options: Partial<PhonemeDetailsOptions> = {}) =>
			render(
				<SoundHeader
					sound={describeSound({
						targetAccent: "en-us",
						phonemeId: "I",
						showFrequencyLink: false,
						...options,
					})}
					titleId="title"
					showExample={showExample}
				/>,
			);
		expect(header(true)).toContain(SYNTHETIC_VOICE_NOTE);
		expect(header(false)).not.toContain(SYNTHETIC_VOICE_NOTE);
		expect(header(true, { showSpellings: false })).not.toContain(SYNTHETIC_VOICE_NOTE);
	});
});
