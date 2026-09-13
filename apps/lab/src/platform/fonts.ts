/**
 * Self-hosted Lab font contract. CSS variables are applied by `fonts.css`.
 * The preload href is for the body face (Noto Sans), matching the previous
 * next/font/google `preload: true` setting.
 */

export const NOTO_SANS_PRELOAD_HREF = "/fonts/noto-sans-latin-wght-normal.woff2";

export const FONT_PRELOADS = [
	{
		href: NOTO_SANS_PRELOAD_HREF,
		as: "font" as const,
		type: "font/woff2",
		crossOrigin: "anonymous" as const,
	},
];
