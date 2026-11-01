import { readFileSync } from "node:fs";
import path from "node:path";
import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DetailSections, getDetailSections } from "@/components/phoneme-details/sections";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { SoundPageContent } from "./sound-page-content";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
}));

function page(phonemeId: EnglishPhonemeSymbolId) {
	return renderToString(
		<AudioManagerProvider>
			<SoundPageContent phonemeId={phonemeId} />
		</AudioManagerProvider>,
	).replaceAll("&#x27;", "'");
}

function headings(html: string) {
	return [...html.matchAll(/<h2 [^>]*>([^<]*)<\/h2>/g)].map(([, title]) => title);
}

describe("the sound page", () => {
	it("makes the sound its h1 and lists the sections in learning order", () => {
		const html = page("TH");
		expect(html.match(/<h1 /g)).toHaveLength(1);
		expect(html).toMatch(/<h1 [^>]*>Voiceless TH \/θ\/<\/h1>/);
		expect(headings(html)).toEqual([
			"How it's made",
			"Compare with",
			"Spelling",
			"Common words with /θ/",
			"Sounds near it",
		]);
	});

	it("sets each similar sound face to face, with only the features that differ", () => {
		const html = page("TH");
		expect(html).toMatch(/aria-label="How \/θ\/ and \/t\/ differ"/);
		expect(html).toMatch(
			/<dt [^>]*>Place<\/dt><dd [^>]*>.*\/θ\/: .*dental<\/dd><dd [^>]*>.*\/t\/: .*alveolar<\/dd>/,
		);
		expect(html).toMatch(
			/<dt [^>]*>Manner<\/dt><dd [^>]*>.*fricative<\/dd><dd [^>]*>.*plosive<\/dd>/,
		);
		expect(html).toContain(">Both voiceless<");
		expect(html).toContain(">Both voiceless, fricative<");
		expect(html).toContain(">Show all 14<");
		expect(html).toMatch(
			/<a href="\/minimal-pairs\/th-t"[^>]*>(All pairs for|Practise saying) \/θ\/ and \/t\//,
		);
		expect(html).toContain(">Can you hear it?<");
	});

	it("says which other sounds the same letters spell, and links the sounds near it", () => {
		const html = page("TH");
		expect(html).toContain(">The same letters also spell<");
		expect(html).toMatch(/aria-label="\/ð\/ voiced TH, as in this"/);
		expect(html).toMatch(
			/rel="prev"[^>]*href="\/sounds\/v-van"|href="\/sounds\/v-van"[^>]*rel="prev"/,
		);
		for (const word of ["think", "something", "month"]) {
			expect(html).toContain(`>${word}<`);
		}
	});

	it("groups /æ/'s variants and its merger note under How it changes, and gives /θ/ none", () => {
		const html = page("AE");
		expect(headings(html)).toContain("How it changes");
		expect(html).toContain(">Mary, marry and merry<");
		expect(html).toMatch(/>æː<.*Longer before a voiced sound/);
		expect(headings(page("TH"))).not.toContain("How it changes");
	});

	it("leaves out the drawer's how-to sentence and the link to the page itself", () => {
		const html = page("TH");
		expect(html).not.toContain("is made with the tongue");
		expect(html).not.toContain("Open full page");
	});
});

describe("the drawer", () => {
	it("keeps the page-only sections out", () => {
		const html = renderToString(
			<AudioManagerProvider>
				<DetailSections
					targetAccent="en-us"
					sections={getDetailSections({ targetAccent: "en-us", phonemeId: "TH" })}
				/>
			</AudioManagerProvider>,
		);
		for (const text of [
			"Sounds near it",
			"Common words",
			"How it changes",
			"Can you hear it?",
			"The same letters also spell",
		]) {
			expect(html).not.toContain(text);
		}
	});

	it("doesn't import the common-word data, so it stays out of the drawer's bundle", () => {
		const dir = path.resolve(import.meta.dirname, "../phoneme-details");
		for (const file of [
			"sections.tsx",
			"details-drawer.tsx",
			"details-panel.tsx",
			"details-card.tsx",
		]) {
			const source = readFileSync(path.join(dir, file), "utf8");
			expect(source, file).not.toMatch(/common-words|sound-page-content|sound-page-blocks/);
		}
	});
});
