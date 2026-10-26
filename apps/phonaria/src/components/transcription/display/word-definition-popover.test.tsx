import type { WordAudioManifest } from "@phonaria/phonetics-data";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { DefinitionBody } from "./word-definition-popover";

const manifest = vi.hoisted(() => ({
	current: undefined as WordAudioManifest | null | undefined,
}));
vi.mock("@/hooks/use-word-audio-manifest", () => ({
	useWordAudioManifest: () => manifest.current,
}));
vi.mock("@/hooks/use-definition", () => ({ useDefinition: vi.fn() }));

/** The dictionary lists past-tense /ɹɛd/ first; the main recording is present tense. */
const recorded: WordAudioManifest = {
	voice: "jenny",
	words: ["read", "seat"],
	forms: {
		read: [
			{ label: "present tense", pronunciation: "R I1 D" },
			{ n: 2, label: "past tense", pronunciation: "R E1 D" },
		],
	},
};

/** The popover's markup, without the comments React puts between adjacent text. */
const popover = (word: string, ipa: string, pronunciation: string) =>
	renderToString(
		<AudioManagerProvider>
			<DefinitionBody
				targetAccent="en-us"
				word={word}
				ipa={ipa}
				pronunciation={pronunciation}
				status="loading"
				groups={[]}
				errorMessage={null}
				onRetry={() => {}}
			/>
		</AudioManagerProvider>,
	).replaceAll("<!-- -->", "");

const buttons = (html: string) =>
	[...html.matchAll(/aria-label="(Hear [^"]*)"/g)].map(([, label]) => label);

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
	manifest.current = recorded;
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("word popover (#378)", () => {
	it("heads the selected variant and plays its recording first", () => {
		const html = popover("read", "ˈɹɛd", "R E1 D");
		expect(html).toContain("/ˈɹɛd/");
		expect(buttons(html)).toEqual(["Hear read, past tense", "Hear read, present tense"]);
	});

	it("moves the other recording first when the learner selects the other variant", () => {
		const html = popover("read", "ˈɹid", "R I1 D");
		expect(html).toContain("/ˈɹid/");
		expect(buttons(html)).toEqual(["Hear read, present tense", "Hear read, past tense"]);
	});

	it("leaves a word recorded once as it was", () => {
		const html = popover("seat", "ˈsit", "S I1 T");
		expect(html).toContain("/ˈsit/");
		expect(buttons(html)).toEqual(["Hear seat"]);
	});
});
