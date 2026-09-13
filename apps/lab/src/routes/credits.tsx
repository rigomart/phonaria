import { createFileRoute } from "@tanstack/react-router";
import { CreditsContent } from "@/components/credits-content";
import { CREDITS_PAGE_DESCRIPTION, CREDITS_PAGE_TITLE } from "@/lib/credits-metadata";
import { getDocumentMetadata } from "@/platform";

export const Route = createFileRoute("/credits")({
	head: () => {
		const documentMetadata = getDocumentMetadata();
		const title = `${CREDITS_PAGE_TITLE} - ${documentMetadata.siteName}`;
		const canonical = `${documentMetadata.siteUrl}/credits`;
		return {
			meta: [
				{ title },
				{ name: "description", content: CREDITS_PAGE_DESCRIPTION },
				{
					name: "robots",
					content: documentMetadata.indexingEnabled ? "index, follow" : "noindex, follow",
				},
				{ property: "og:title", content: documentMetadata.siteName },
				{ property: "og:description", content: documentMetadata.description },
				{ property: "og:site_name", content: documentMetadata.siteName },
				{ property: "og:url", content: canonical },
				{ name: "twitter:card", content: "summary" },
				{ name: "twitter:title", content: documentMetadata.siteName },
				{ name: "twitter:description", content: documentMetadata.description },
			],
			links: [{ rel: "canonical", href: canonical }],
		};
	},
	component: CreditsRoute,
});

function CreditsRoute() {
	return <CreditsContent />;
}
