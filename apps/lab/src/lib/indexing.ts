import { getSiteUrl, isIndexingEnabled } from "./site";

/**
 * Indexable application paths. `/ipa-chart` only redirects, and Practice stays out of
 * search whether or not its flag is on.
 */
export const INDEXABLE_PATHS = [
	"/",
	"/ipa-chart/consonants",
	"/ipa-chart/vowels",
	"/credits",
] as const;

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

export function getSitemapUrls(siteUrl = getSiteUrl()): string[] {
	return INDEXABLE_PATHS.map((path) => (path === "/" ? siteUrl : `${siteUrl}${path}`));
}

export function formatSitemapXml(urls: string[] = getSitemapUrls()): string {
	const entries = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
