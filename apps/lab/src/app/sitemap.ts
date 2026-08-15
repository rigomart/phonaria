import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/**
 * The indexable routes. `/ipa-chart` only redirects to its consonants tab, and
 * practice pages stay out of search whether or not their flag is on.
 */
const INDEXABLE_PATHS = ["/", "/ipa-chart/consonants", "/ipa-chart/vowels", "/credits"];

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = getSiteUrl();
	return INDEXABLE_PATHS.map((path) => ({
		url: path === "/" ? siteUrl : `${siteUrl}${path}`,
	}));
}
