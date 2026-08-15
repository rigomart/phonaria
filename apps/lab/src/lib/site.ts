/**
 * Site identity: the only module that reads the deployment's URL, indexing,
 * and search-verification env vars. Metadata, robots, and the sitemap all
 * source their values here so the app serves correct SEO surfaces on whatever
 * domain hosts it.
 *
 * Reads happen inside the getters, but consumers (layout metadata, robots,
 * sitemap) evaluate at build time — changing these vars requires a redeploy,
 * same as the FLAG_* convention.
 */

export const SITE_NAME = "Phonaria Lab";
export const SITE_DESCRIPTION = "Experimental workspace for phonetic transcription tools";

const DEV_SITE_URL = "http://localhost:3000";

/**
 * Absolute origin the site is served from, without a trailing slash. Throws in
 * production rather than silently emitting localhost URLs into metadata.
 */
export function getSiteUrl(): string {
	const raw = process.env.SITE_URL?.trim();
	if (!raw) {
		if (process.env.NODE_ENV === "production") {
			throw new Error(
				"SITE_URL is not set. Set it to the absolute origin serving this app (e.g. https://phonaria.rigos.dev) so canonical, OpenGraph, robots, and sitemap URLs are correct.",
			);
		}
		return DEV_SITE_URL;
	}
	try {
		new URL(raw);
	} catch {
		throw new Error(
			`SITE_URL is not an absolute URL: "${raw}". Include the scheme, e.g. https://phonaria.rigos.dev.`,
		);
	}
	return raw.replace(/\/+$/, "");
}

/** Indexability is its own switch, independent of which domain serves the app. */
export function isIndexingEnabled(): boolean {
	const raw = process.env.SITE_INDEXING_ENABLED;
	if (raw === undefined || raw === "") return false;
	return raw === "1" || raw.toLowerCase() === "true";
}

export function getGoogleSiteVerification(): string | undefined {
	return process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;
}
