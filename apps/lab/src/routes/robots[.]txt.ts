import { createFileRoute } from "@tanstack/react-router";
import { formatRobotsTxt } from "@/lib/indexing";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(formatRobotsTxt(), {
					headers: {
						"Content-Type": "text/plain; charset=utf-8",
						"Content-Security-Policy": getContentSecurityPolicy(),
					},
				}),
		},
	},
});
