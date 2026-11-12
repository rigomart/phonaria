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
		expect(html).toMatch(/<h1 [^>]*>Voiceless TH<\/h1>/);
		expect(headings(html)).toEqual([
			"How it's made",
			"Compare with",
			"Spelling",
			"Common words with θ",
		]);
	});

	it("sets each similar sound face to face, with only the features that differ", () => {
		const html = page("TH");
		expect(html).toMatch(/aria-label="How θ and t differ"/);
		expect(html).toMatch(
			/<dt [^>]*>Place<\/dt><dd [^>]*>.*θ: .*dental<\/dd><dd [^>]*>.*t: .*alveolar<\/dd>/,
		);
		expect(html).toMatch(
			/<dt [^>]*>Manner<\/dt><dd [^>]*>.*fricative<\/dd><dd [^>]*>.*plosive<\/dd>/,
		);
		expect(html).not.toContain(">Both ");
		expect(html).toContain(">Show all 14<");
		expect(html).toMatch(
			/<a href="\/minimal-pairs\/th-t"[^>]*>(All pairs for|Practice saying) \/θ\/ and \/t\//,
		);
		expect(html).toContain(">Can you hear it?<");
	});

	it("ranks the spellings by how much of the sound they spell, rarer ones apart", () => {
		const html = page("F");
		const list = html.slice(html.indexOf('aria-label="Spellings, most common first"'));
		const order = ["f", "ff", "ph"].map((spelling) =>
			list.indexOf(`font-semibold text-foreground">${spelling}</span>`),
		);
		expect(order.every((at, i) => at > 0 && (i === 0 || at > order[i - 1]))).toBe(true);
		expect(list).toMatch(/>f<\/span><span [^>]*>\d\d\.\d%<\/span>/);
		expect(html).toContain(">Rarer spellings, under 2% each<");
		expect(html).toMatch(/>gh<\/span>.*enou<mark [^>]*>gh<\/mark>/);
	});

	it("links a common word that has its own page, and leaves the rest plain", () => {
		const html = page("F");
		const common = html.slice(html.indexOf(">Common words with f<"));
		expect(common).toMatch(/<a href="\/words\/enough"[^>]*>enough<\/a>/);
		expect(common).toContain('aria-label="Hear enough"');
		expect(common).not.toContain('href="/words/if"');
		expect(common).toContain('aria-label="Hear if"');
	});

	it("says which other sounds the same letters spell, and links the previous and next sounds", () => {
		const html = page("TH");
		expect(html).toContain(">The same letters also spell<");
		expect(html).toMatch(/aria-label="Voiced TH, as in this"/);
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
		expect(html).toMatch(/>eə<.*Starts closer to the e in bed.*When: <!-- -->right before m or n/);
		expect(html).toMatch(/>æː<.*The vowel is longer in the first word than in the second/);
		expect(headings(page("TH"))).not.toContain("How it changes");
	});

	it("says how a consonant is made once, in plain words, and not again as labelled chips", () => {
		const html = page("TH");
		const pinned = html.slice(0, html.indexOf(">Compare with<"));
		expect(html).toContain(
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap, with the voice off.",
		);
		expect(pinned).not.toMatch(/<dt /);
		expect(html).not.toContain("Open full page");
	});

	it("gives a vowel its chart and its name alone, with no chips and no unreadable axis labels", () => {
		const html = page("AE");
		expect(html.slice(0, html.indexOf(">Compare with<"))).not.toMatch(/<dt /);
		expect(html).not.toContain("Cl-mid");
		expect(html).not.toContain("Op-mid");
	});

	it("keeps a diphthong's start and end as labelled values", () => {
		expect(page("AU")).toMatch(/<dt [^>]*>Starts<\/dt>/);
	});

	it("credits the recording at the bottom, after the previous and next links, and never mentions the voice", () => {
		const html = page("T");
		expect(html.indexOf("Recording:")).toBeGreaterThan(html.indexOf('aria-label="Other sounds"'));
		expect(html).not.toContain("computer-generated");
	});
});

describe("the drawer", () => {
	it("keeps the page-only sections out", () => {
		const html = renderToString(
			<AudioManagerProvider>
				<DetailSections sections={getDetailSections({ targetAccent: "en-us", phonemeId: "TH" })} />
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
