/**
 * Application fonts. Fontsource's latin-weight `wght.css` entries declare the
 * faces; `./fonts.css` (imported by `src/styles.css`) maps them to
 * `--font-display-serif` / `--font-noto-sans`. The entries are linked as their
 * own stylesheets so Vite resolves their relative font URLs where they live.
 */

import notoSansLatinExtUrl from "@fontsource-variable/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2?url";
import notoSansLatinUrl from "@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2?url";
import notoSansCss from "@fontsource-variable/noto-sans/wght.css?url";
import soraLatinUrl from "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url";
import soraCss from "@fontsource-variable/sora/wght.css?url";

/** Linked by the root route on every page. */
export const fontStylesheets = [soraCss, notoSansCss].map((href) => ({ rel: "stylesheet", href }));

/**
 * The faces the home intro draws at display size: Sora for the name, Noto Sans
 * latin and latin-ext for its IPA (ə, ɑ, ɛ, ɹ and ˈ live in latin-ext). Preloading
 * them starts the download alongside the stylesheet instead of after it. These
 * are the hashed files Fontsource already ships, not vendored copies.
 */
export const homeIntroFontPreloads = [soraLatinUrl, notoSansLatinUrl, notoSansLatinExtUrl].map(
	(href) => ({
		rel: "preload",
		as: "font",
		type: "font/woff2",
		href,
		crossOrigin: "anonymous" as const,
	}),
);
