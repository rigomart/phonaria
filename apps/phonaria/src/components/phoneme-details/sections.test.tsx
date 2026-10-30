import type { LanguagePhonemeId, TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { PhonemeDetailsPage } from "./details-page";
import { DetailSections, getDetailSections } from "./sections";

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
		<a href={`${to}?${new URLSearchParams(search)}`} {...props}>
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

describe("practice links under Compare with", () => {
	it("links each similar sound to minimal-pair practice of that pair", () => {
		vi.stubEnv("FLAG_SPEECH", "1");
		const html = render("I");
		expect(html).toContain('href="/minimal-pairs?contrast=i-ix"');
		expect(html).toContain("Practise saying /<!-- -->i<!-- -->/ and /<!-- -->ɪ<!-- -->/");
	});

	it("leaves the links out while speaking practice is off", () => {
		vi.stubEnv("FLAG_SPEECH", "0");
		const html = render("I");
		expect(html).toContain("Compare with");
		expect(html).not.toContain("/minimal-pairs");
	});
});

describe("the two layouts", () => {
	it("heads the sections with h3s under the drawer's h2, stacked", () => {
		const html = render("TH");
		expect(html).toContain('<div class="flex flex-col gap-6">');
		expect(html).toMatch(
			/<h3 [^>]*class="text-sm font-semibold text-foreground"[^>]*>How it&#x27;s made<\/h3>/,
		);
		expect(html).not.toContain("<h2");
	});

	it("makes the sound the page's h1 and each section an h2, in columns on wide screens", () => {
		const html = renderToString(
			<AudioManagerProvider>
				<PhonemeDetailsPage options={{ targetAccent: "en-us", phonemeId: "TH" }} />
			</AudioManagerProvider>,
		);
		expect(html).toMatch(/<h1 [^>]*>.*Voiceless dental fricative<\/h1>/);
		expect(html).toContain("lg:grid-cols-2");
		for (const title of ["How it&#x27;s made", "Compare with", "Spelling"]) {
			expect(html).toMatch(new RegExp(`<h2 [^>]*>${title}</h2>`));
		}
		expect(html).not.toContain("<h3");
	});
});
