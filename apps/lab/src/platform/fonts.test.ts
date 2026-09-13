import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const platformDir = import.meta.dirname;
const fontsTs = readFileSync(resolve(platformDir, "fonts.ts"), "utf8");
const fontsCss = readFileSync(resolve(platformDir, "fonts.css"), "utf8");
const layoutSource = readFileSync(resolve(platformDir, "../app/layout.tsx"), "utf8");
const packageJson = readFileSync(resolve(platformDir, "../../package.json"), "utf8");
const publicFontsDir = resolve(platformDir, "../../public/fonts");

describe("Fontsource fonts", () => {
	it("loads latin-weight CSS for Sora and Noto Sans", () => {
		expect(packageJson).toContain('"@fontsource-variable/sora"');
		expect(packageJson).toContain('"@fontsource-variable/noto-sans"');
		expect(packageJson).not.toContain("noto-serif");
		expect(fontsTs).toContain('import "@fontsource-variable/sora/wght.css"');
		expect(fontsTs).toContain('import "@fontsource-variable/noto-sans/wght.css"');
		expect(fontsTs).not.toMatch(/noto-serif|Noto Serif/i);
		expect(fontsCss).toContain("--font-display-serif");
		expect(fontsCss).toContain("--font-noto-sans");
		expect(fontsCss).toContain('"Sora Variable"');
		expect(fontsCss).toContain('"Noto Sans Variable"');
		expect(fontsCss).not.toContain("@font-face");
		expect(fontsCss).not.toContain("/fonts/");
		expect(`${fontsTs}\n${fontsCss}`).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic.com/i);
	});

	it("does not vendor public font files or use next/font/google", () => {
		expect(existsSync(publicFontsDir)).toBe(false);
		expect(layoutSource).not.toContain("next/font/google");
		expect(layoutSource).not.toContain("FONT_PRELOADS");
		expect(layoutSource).toContain('import "@/platform/fonts"');
	});
});
