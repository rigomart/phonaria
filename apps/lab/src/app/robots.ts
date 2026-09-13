import type { MetadataRoute } from "next";
import { getRobotsPolicy } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
	return getRobotsPolicy();
}
