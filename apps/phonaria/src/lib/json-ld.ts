const SCRIPT_UNSAFE = /[<>&\u2028\u2029]/g;

/**
 * JSON for an inline `<script type="application/ld+json">`. Escaping `<` keeps a
 * `</script>` inside a string from closing the tag; the escapes parse back unchanged.
 */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(
		SCRIPT_UNSAFE,
		(char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
	);
}

export function jsonLdScript(data: unknown) {
	return { type: "application/ld+json", children: serializeJsonLd(data) };
}

export function buildWebSiteStructuredData(name: string, url: string) {
	return { "@context": "https://schema.org", "@type": "WebSite", name, url };
}

/** schema.org `BreadcrumbList`, one item per page from the top level down, each at its absolute URL. */
export function buildBreadcrumbStructuredData(
	siteUrl: string,
	crumbs: readonly { name: string; path: string }[],
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: crumbs.map(({ name, path }, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name,
			item: `${siteUrl}${path}`,
		})),
	};
}
