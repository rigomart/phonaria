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
	it("adds a summary, how a consonant is made, related sounds and common words", () => {
		const html = page("TH");
		expect(html).toContain(
			"/θ/ is the th in 'thin' and 'think'. Its voiced partner is /ð/, the th in 'this'.",
		);
		expect(html).toContain(
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap, with the voice off.",
		);
		expect(headings(html)).toEqual([
			"How it's made",
			"Compare with",
			"Related sounds",
			"Spelling",
			"Common words with /θ/",
		]);
		expect(html).toMatch(/<a href="\/sounds\/th-this"[^>]*>.*voiced TH, as in 'this'/);
		for (const label of ["At the start", "Inside", "At the end"]) {
			expect(html).toMatch(new RegExp(`<h3 [^>]*>${label}</h3>`));
		}
		for (const word of ["think", "something", "month"]) {
			expect(html).toContain(`>${word}<`);
		}
	});

	it("shows /t/'s variants, the flap in 'water' among them, and none for /θ/", () => {
		const html = page("T");
		expect(headings(html).at(-1)).toBe("Sound variants");
		expect(html).toMatch(/>ɾ<.*A quick tap of the tongue, between vowels.*>water</);
		expect(headings(page("TH"))).not.toContain("Sound variants");
	});

	it("links schwa to neighbouring vowels and gives it no how-it's-made sentence", () => {
		const html = page("AX");
		expect(headings(html)).toContain("Related sounds");
		for (const slug of ["ae-cat", "er-her", "eh-red", "uh-cup"]) {
			expect(html).toContain(`href="/sounds/${slug}"`);
		}
		expect(html).not.toContain("is made with");
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
			"Related sounds",
			"Common words",
			"Sound variants",
			"is made with",
			"is the th in",
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
			expect(source, file).not.toMatch(/common-words|sound-page-content|sound-page-sections/);
		}
	});
});
