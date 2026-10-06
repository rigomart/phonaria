import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const platformDir = import.meta.dirname;
const fontsTs = readFileSync(resolve(platformDir, "fonts.ts"), "utf8");
const fontsCss = readFileSync(resolve(platformDir, "fonts.css"), "utf8");
const stylesCss = readFileSync(resolve(platformDir, "../styles.css"), "utf8");
const rootRouteSource = readFileSync(resolve(platformDir, "../routes/__root.tsx"), "utf8");
const homeRouteSource = readFileSync(resolve(platformDir, "../routes/index.tsx"), "utf8");
const packageJson = readFileSync(resolve(platformDir, "../../package.json"), "utf8");
const publicFontsDir = resolve(platformDir, "../../public/fonts");

describe("Fontsource fonts", () => {
	it("loads latin-weight CSS for Sora and Noto Sans", () => {
		expect(packageJson).toContain('"@fontsource-variable/sora"');
		expect(packageJson).toContain('"@fontsource-variable/noto-sans"');
		expect(packageJson).not.toContain("noto-serif");
		expect(fontsTs).toContain('from "@fontsource-variable/sora/wght.css?url"');
		expect(fontsTs).toContain('from "@fontsource-variable/noto-sans/wght.css?url"');
		expect(fontsTs).not.toContain("@fontsource-variable/noto-serif");
		expect(stylesCss).toContain('@import "./lib/fonts.css";');
		// Inlined by Tailwind, Fontsource's relative font URLs are not rebased in the build.
		expect(stylesCss).not.toMatch(/@import "@fontsource/);
		expect(fontsCss).toContain("--font-display-serif");
		expect(fontsCss).toContain("--font-noto-sans");
		expect(fontsCss).toContain('"Sora Variable"');
		expect(fontsCss).toContain('"Noto Sans Variable"');
		expect(fontsCss).not.toContain("@font-face");
		expect(fontsCss).not.toContain("/fonts/");
		expect(`${fontsTs}\n${fontsCss}\n${stylesCss}`).not.toMatch(
			/fonts\.googleapis\.com|fonts\.gstatic.com/i,
		);
	});

	it("preloads only Fontsource's own files, from the home route", () => {
		const preloads = [...fontsTs.matchAll(/from "([^"]+\.woff2)\?url"/g)].map((match) => match[1]);
		expect(preloads).toEqual([
			"@fontsource-variable/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2",
			"@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2",
			"@fontsource-variable/sora/files/sora-latin-wght-normal.woff2",
		]);
		expect(homeRouteSource).toContain("homeIntroFontPreloads");
		expect(rootRouteSource).not.toContain("homeIntroFontPreloads");
	});

	it("does not vendor public font files", () => {
		expect(existsSync(publicFontsDir)).toBe(false);
		expect(rootRouteSource).not.toContain("FONT_PRELOADS");
	});

	it("links its stylesheets instead of importing CSS for its side effects", () => {
		expect(rootRouteSource).toContain('import appCss from "@/styles.css?url"');
		expect(rootRouteSource).toContain('{ rel: "stylesheet", href: appCss }, ...fontStylesheets');
		expect(rootRouteSource).not.toMatch(/^import "[^"]+\.css";?$/m);
		expect(fontsTs).not.toMatch(/^import "[^"]+";?$/m);
	});
});
