import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { getContrastPage } from "@/lib/minimal-pairs";
import { ContrastPageView } from "./contrast-page";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
	useNavigate: () => () => Promise.resolve(),
}));

afterEach(() => {
	vi.unstubAllEnvs();
});

function render() {
	const page = getContrastPage("th-s");
	if (!page) throw new Error("th-s is in the catalog");
	return renderToString(
		<AudioManagerProvider>
			<ContrastPageView page={page} word="think" />
		</AudioManagerProvider>,
	);
}

describe("a contrast page", () => {
	it("lists every pair under its two sounds without speaking practice", () => {
		vi.stubEnv("FLAG_SPEECH", "0");
		const html = render();
		expect(html).toContain("/<!-- -->θ<!-- -->/ vs /<!-- -->s<!-- -->/");
		expect(html).toContain(
			"/θ/ is made with the tongue between the teeth. /s/ is made with the tongue tip on the gum ridge behind the top teeth. Everything else is the same.",
		);
		expect(html).toContain("Voiceless dental fricative");
		for (const word of ["thin", "sin", "think", "sink", "tenth", "tense"]) {
			expect(html).toContain(`>${word}<`);
		}
		expect(html).toContain('href="/minimal-pairs"');
		expect(html).not.toContain("Say a word");
		expect(html).not.toContain("Record");
	});

	it("adds speaking practice on the contrast's words where speech is on", () => {
		vi.stubEnv("FLAG_SPEECH", "1");
		const html = render();
		expect(html).toContain("Say a word");
		expect(html).toContain("Record");
		expect(html).toContain(">think<");
	});
});
