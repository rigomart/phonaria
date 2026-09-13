import type { MetadataRoute } from "next";
import { getSitemapUrls } from "@/lib/indexing";

export default function sitemap(): MetadataRoute.Sitemap {
	return getSitemapUrls().map((url) => ({ url }));
}
