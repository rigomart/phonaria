import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FONT_PRELOADS, NOTO_SANS_PRELOAD_HREF } from "./fonts";

const fontsCss = readFileSync(resolve(import.meta.dirname, "fonts.css"), "utf8");
const layoutSource = readFileSync(resolve(import.meta.dirname, "../app/layout.tsx"), "utf8");

describe("self-hosted fonts", () => {
	it("declares local Sora and Noto Sans faces without remote font services", () => {
		expect(fontsCss).toContain('font-family: "Sora"');
		expect(fontsCss).toContain('font-family: "Noto Sans"');
		expect(fontsCss).toContain('url("/fonts/sora-latin-wght-normal.woff2")');
		expect(fontsCss).toContain('url("/fonts/noto-sans-latin-wght-normal.woff2")');
		expect(fontsCss).not.toMatch(/fonts\.googleapis|fonts\.gstatic|next\/font\/google/i);
	});

	it("exposes the Noto Sans preload used by the Next.js layout adapter", () => {
		expect(NOTO_SANS_PRELOAD_HREF).toBe("/fonts/noto-sans-latin-wght-normal.woff2");
		expect(FONT_PRELOADS).toEqual([
			{
				href: NOTO_SANS_PRELOAD_HREF,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
		]);
	});

	it("keeps the root layout free of next/font/google", () => {
		expect(layoutSource).not.toContain("next/font/google");
		expect(layoutSource).toContain("@/platform/fonts.css");
	});
});
