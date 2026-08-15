import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexingEnabled } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	// Crawling stays allowed even when indexing is off: a Disallow would keep
	// crawlers from ever fetching the pages and seeing their noindex tag.
	const rules = { userAgent: "*", allow: "/" };
	if (!isIndexingEnabled()) return { rules };
	return { rules, sitemap: `${getSiteUrl()}/sitemap.xml` };
}
