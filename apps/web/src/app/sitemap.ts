import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getLocalePath, SITE_URL } from "@/lib/seo";

const ROUTES = ["", "/transcription", "/ipa-chart", "/insights", "/credits"];

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();

	return ROUTES.flatMap((path) =>
		routing.locales.map((locale) => ({
			url: `${SITE_URL}${getLocalePath(locale, path)}`,
			lastModified,
			changeFrequency: path === "" ? "weekly" : "monthly",
			priority: path === "" ? 1 : 0.7,
		})),
	);
}
