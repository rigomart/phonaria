import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { betaNotice, Header } from "./header";
import { soundsSections } from "./site-nav";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
	useLocation: ({ select }: { select: (location: { pathname: string }) => string }) =>
		select({ pathname: "/ipa-chart/vowels" }),
}));

vi.mock("./theme-switcher", () => ({ ThemeSwitcher: () => null }));

const FLAGS = {
	practice: false,
	languageHistory: false,
	about: false,
	speech: false,
	soundSearch: false,
};

function mainNavHtml() {
	const html = renderToString(<Header flags={FLAGS} />);
	const nav = html.match(/<nav [^>]*aria-label="Main".*?<\/nav>/s)?.[0];
	expect(nav, "the header renders the main nav").toBeDefined();
	return nav ?? "";
}

describe("betaNotice", () => {
	it("names scores only while speech scoring ships", () => {
		expect(betaNotice({ speech: true })).toContain("scores");
		expect(betaNotice({ speech: false })).not.toContain("scores");
	});
});

describe("Header", () => {
	it("server-renders every Sounds menu link while the menu is closed, so crawlers find them", () => {
		const nav = mainNavHtml();
		for (const section of soundsSections) {
			expect(nav).toContain(`href="${section.href}"`);
		}
	});

	it("puts the sliding indicator before the nav list, so the items paint over it", () => {
		const nav = mainNavHtml();
		const indicator = nav.indexOf('<span aria-hidden="true"');
		expect(indicator).toBeGreaterThan(-1);
		expect(indicator).toBeLessThan(nav.indexOf("<ul"));
	});
});
