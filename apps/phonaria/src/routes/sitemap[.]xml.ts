import { createFileRoute } from "@tanstack/react-router";
import { formatSitemapXml } from "@/lib/indexing";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: () =>
				new Response(formatSitemapXml(), {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
					},
				}),
		},
	},
});
