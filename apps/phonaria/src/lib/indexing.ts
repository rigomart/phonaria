import { ABOUT_PATH } from "./about/metadata";
import { type AppFlags, flags } from "./flags";
import { LANGUAGE_HISTORY_PATH } from "./language-history/metadata";
import { listContrastPagePaths } from "./minimal-pairs";
import { MinimalPairActivity } from "./practice/minimal-pair-activity";
import { getSiteUrl, isIndexingEnabled } from "./site";
import { listSoundPagePaths, SOUNDS_PATH } from "./sound-pages";

/** `/ipa-chart` only redirects, so it is not listed. */
const UNFLAGGED_INDEXABLE_PATHS = [
	"/",
	"/ipa-chart/consonants",
	"/ipa-chart/vowels",
	"/ipa-chart/frequency",
	"/credits",
] as const;

/**
 * Indexable application paths for a build's flags. About and History join
 * only when their flags are on, since their routes 404 otherwise. Practice stays out of search
 * whether or not its flag is on. The minimal-pair pages are listed in every
 * build, since their pairs show without the `speech` flag, and so are the
 * sound pages.
 */
export function getIndexablePaths(
	enabled: Pick<AppFlags, "about" | "languageHistory"> = flags.snapshot(),
): string[] {
	return [
		...UNFLAGGED_INDEXABLE_PATHS,
		MinimalPairActivity.path,
		...listContrastPagePaths(),
		SOUNDS_PATH,
		...listSoundPagePaths(),
		...(enabled.about ? [ABOUT_PATH] : []),
		...(enabled.languageHistory ? [LANGUAGE_HISTORY_PATH] : []),
	];
}

export type RobotsPolicy = {
	rules: { userAgent: "*"; allow: "/" };
	sitemap: string | undefined;
};

export function getRobotsPolicy(
	siteUrl = getSiteUrl(),
	indexingEnabled = isIndexingEnabled(),
): RobotsPolicy {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: indexingEnabled ? `${siteUrl}/sitemap.xml` : undefined,
	};
}

export function formatRobotsTxt(policy: RobotsPolicy = getRobotsPolicy()): string {
	const lines = [`User-Agent: ${policy.rules.userAgent}`, `Allow: ${policy.rules.allow}`];
	if (policy.sitemap) {
		lines.push("", `Sitemap: ${policy.sitemap}`);
	}
	return `${lines.join("\n")}\n`;
}

export function getSitemapUrls(
	siteUrl = getSiteUrl(),
	paths: readonly string[] = getIndexablePaths(),
): string[] {
	return paths.map((path) => (path === "/" ? siteUrl : `${siteUrl}${path}`));
}

export function formatSitemapXml(urls: string[] = getSitemapUrls()): string {
	const entries = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
