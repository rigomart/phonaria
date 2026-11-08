import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "./footer";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
}));

describe("Footer", () => {
	it("links About before Credits when FLAG_ABOUT is on", () => {
		const html = renderToString(<Footer flags={{ about: true }} />);
		expect(html).toContain('href="/about"');
		expect(html.indexOf('href="/about"')).toBeLessThan(html.indexOf('href="/credits"'));
	});

	it("hides the About link when FLAG_ABOUT is off", () => {
		const html = renderToString(<Footer flags={{ about: false }} />);
		expect(html).not.toContain('href="/about"');
		expect(html).toContain('href="/credits"');
	});

	it("links to the issue tracker to report a problem, in a new tab", () => {
		const html = renderToString(<Footer flags={{ about: false }} />);
		const link = html.match(
			/<a [^>]*href="https:\/\/github.com\/rigomart\/phonaria\/issues"[^>]*>(.*?)<\/a>/,
		);
		expect(link?.[0]).toContain('target="_blank"');
		expect(link?.[1]).toBe('Report a problem<span class="sr-only"> (opens in a new tab)</span>');
	});
});
