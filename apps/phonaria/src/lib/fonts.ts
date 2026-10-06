import notoSansLatinExtUrl from "@fontsource-variable/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2?url";
import notoSansLatinUrl from "@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2?url";
import notoSansCss from "@fontsource-variable/noto-sans/wght.css?url";
import soraLatinUrl from "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url";
import soraCss from "@fontsource-variable/sora/wght.css?url";

/** Linked on their own so Vite resolves their relative font URLs. */
export const fontStylesheets = [soraCss, notoSansCss].map((href) => ({ rel: "stylesheet", href }));

/** The home intro's faces. Its IPA symbols (ə, ɑ, ɹ, ˈ) are in latin-ext. */
export const homeIntroFontPreloads = [soraLatinUrl, notoSansLatinUrl, notoSansLatinExtUrl].map(
	(href) => ({
		rel: "preload",
		as: "font",
		type: "font/woff2",
		href,
		crossOrigin: "anonymous" as const,
	}),
);
