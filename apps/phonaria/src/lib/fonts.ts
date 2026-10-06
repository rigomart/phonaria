/**
 * Application font contract. Import this module to load Fontsource variable faces and
 * apply `--font-display-serif` / `--font-noto-sans`.
 *
 * `wght.css` is the latin-weight entry used by Vite and TanStack Start.
 */
import "@fontsource-variable/sora/wght.css";
import "@fontsource-variable/noto-sans/wght.css";
import "./fonts.css";
import notoSansLatinExtUrl from "@fontsource-variable/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2?url";
import notoSansLatinUrl from "@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2?url";
import soraLatinUrl from "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url";

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
