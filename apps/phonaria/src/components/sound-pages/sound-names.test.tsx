import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SoundTile } from "@/components/phoneme-details/sound-tile";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { PreviousNext, SoundFamilies, Spelling } from "./sound-page-blocks";
import { SoundsContent } from "./sounds-content";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
}));

/** The opening tag of the link to `href`. */
function linkTag(html: string, href: string) {
	return html.match(new RegExp(`<a [^>]*href="${href}"[^>]*>`))?.[0] ?? "";
}

describe("a sound's name beside its symbol", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("lists each sound with its symbol, its name as a small label and its key word", () => {
		const html = renderToString(<SoundsContent />);
		expect(linkTag(html, "/sounds/t-top")).toContain('aria-label="T, as in top"');
		expect(linkTag(html, "/sounds/th-thin")).toContain('aria-label="Voiceless TH, as in thin"');
		expect(html).toMatch(
			/<span class="font-display[^"]*">θ<\/span><span class="truncate[^"]*">Voiceless TH<\/span>/,
		);
	});

	it("shows the next and previous sounds' symbols in a box and says their names", () => {
		const html = renderToString(<PreviousNext phonemeId="T" />);
		expect(linkTag(html, "/sounds/b-bat")).toContain('aria-label="Previous sound: B"');
		expect(linkTag(html, "/sounds/d-day")).toContain('aria-label="Next sound: D"');
		expect(html).toMatch(/<span class="truncate[^"]*">B<\/span>/);
		expect(html).toMatch(/<span class="truncate[^"]*">D<\/span>/);
	});

	it("names the sounds near it without reading the letter twice", () => {
		const html = renderToString(<SoundFamilies phonemeId="T" />);
		expect(linkTag(html, "/sounds/d-day")).toContain('aria-label="D, as in day"');
	});

	it("names the other sounds the same letters spell the same way", () => {
		const html = renderToString(
			<AudioManagerProvider>
				<Spelling phonemeId="TH" />
			</AudioManagerProvider>,
		);
		expect(linkTag(html, "/sounds/th-this")).toContain('aria-label="Voiced TH, as in this"');
	});

	it("names the symbol of a sound with no recording, since its heading doesn't", () => {
		const html = renderToString(
			<AudioManagerProvider>
				<SoundTile ipa="ɔɪ" name="OY" audioPath={null} />
			</AudioManagerProvider>,
		);
		expect(html).toContain('role="img" aria-label="ɔɪ"');
	});

	it("names the sound, not its symbol, on the button that plays it", () => {
		vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
		const html = renderToString(
			<AudioManagerProvider>
				<SoundTile ipa="θ" name="Voiceless TH" audioPath="/audio/phonemes/TH.ogg" />
			</AudioManagerProvider>,
		);
		expect(html).toContain('aria-label="Play Voiceless TH"');
		expect(html).not.toContain('aria-label="Play θ"');
	});
});
