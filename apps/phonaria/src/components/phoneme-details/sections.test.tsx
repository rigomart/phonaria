import type { LanguagePhonemeId, TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { DetailSections, getDetailSections } from "./sections";
import { describeSound, type PhonemeDetailsOptions } from "./sound";
import { SoundHeader } from "./sound-header";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		search,
		children,
		...props
	}: {
		to: string;
		search?: Record<string, string>;
		children: ReactNode;
	}) => (
		<a href={search ? `${to}?${new URLSearchParams(search)}` : to} {...props}>
			{children}
		</a>
	),
}));

afterEach(() => {
	vi.unstubAllEnvs();
});

function render(phonemeId: LanguagePhonemeId<TargetAccent>) {
	return renderToString(
		<AudioManagerProvider>
			<DetailSections
				targetAccent="en-us"
				sections={getDetailSections({ targetAccent: "en-us", phonemeId, showChartLink: false })}
			/>
		</AudioManagerProvider>,
	);
}

describe("merger notes in the sound details", () => {
	it("explains the cot–caught merger on /ɔ/, words in italics and sounds in the IPA face", () => {
		const html = render("O");
		expect(html).toContain("Cot and caught");
		expect(html).toContain("Linguists call this the cot–caught merger.");
		expect(html).toContain("<em>caught</em>");
		expect(html).toContain('<span class="font-display">/<!-- -->ɑ<!-- -->/</span>');
	});

	it("explains marry–merry on /æ/ and /ɛ/", () => {
		for (const phonemeId of ["AE", "E"] as const) {
			expect(render(phonemeId)).toContain("Mary, marry and merry");
		}
	});

	it("leaves the section out for a sound without a note", () => {
		const html = render("I");
		expect(html).toContain("Spelling");
		expect(html).not.toContain("merger");
		expect(html).not.toContain("Cot and caught");
	});
});

describe("contrast links under Compare with", () => {
	it("links each similar sound to the page of that contrast", () => {
		vi.stubEnv("FLAG_SPEECH", "0");
		const html = render("I");
		expect(html).toMatch(/<a [^>]*href="\/minimal-pairs\/i-ix"[^>]*>All pairs for \/i\/ and \/ɪ\//);
		expect(html).not.toContain("Practise saying");
	});

	it("offers practice there while speaking practice is on", () => {
		vi.stubEnv("FLAG_SPEECH", "1");
		const html = render("I");
		expect(html).toMatch(
			/<a [^>]*href="\/minimal-pairs\/i-ix"[^>]*>Practise saying \/i\/ and \/ɪ\//,
		);
	});
});

describe("the sections", () => {
	it("head each section with an h3 under the drawer's h2, stacked", () => {
		const html = render("TH");
		expect(html).toContain('<div class="flex flex-col gap-6">');
		expect(html).toMatch(
			/<h3 [^>]*class="text-sm font-semibold text-foreground"[^>]*>How it&#x27;s made<\/h3>/,
		);
		expect(html).not.toContain("<h2");
	});
});

describe("the link to the sound's own page", () => {
	function header(options: PhonemeDetailsOptions) {
		return renderToString(
			<AudioManagerProvider>
				<SoundHeader sound={describeSound(options)} titleId="title" />
			</AudioManagerProvider>,
		);
	}

	it("links the details to the sound's page", () => {
		expect(header({ targetAccent: "en-us", phonemeId: "TH" })).toMatch(
			/<a [^>]*href="\/sounds\/th-thin"[^>]*>Open full page/,
		);
	});

	it("leaves it out in Practice and for an accent without pages", () => {
		expect(header({ targetAccent: "en-us", phonemeId: "TH", showPageLink: false })).not.toContain(
			"Open full page",
		);
		expect(header({ targetAccent: "es-419", phonemeId: "S" })).not.toContain("Open full page");
	});
});
