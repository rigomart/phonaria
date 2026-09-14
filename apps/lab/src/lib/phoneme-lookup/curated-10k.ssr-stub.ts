import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";

/**
 * Empty stand-in used only in the Start SSR/Worker build. The real 10k table
 * stays on the client dynamic-import path.
 */
export const EnglishCuratedTop10k: CuratedWordData = {
	meta: {
		version: "ssr-stub",
		tier: "top-10k",
		wordCount: 0,
		generatedAt: "",
		license: "",
		attribution: "",
		sources: { wordfreq: "", cmudict: "" },
	},
	words: {},
};
