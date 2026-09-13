/**
 * Framework-neutral runtime configuration for the Lab shell.
 * Values come from process.env so Next.js and TanStack Start can both supply
 * them. `NEXT_PUBLIC_*` names are the Next.js public-env adapter aliases.
 */

export {
	getDocumentMetadata,
	getGoogleSiteVerification,
	getPublicAssetBaseUrl,
	getSiteUrl,
	isIndexingEnabled,
	SITE_DESCRIPTION,
	SITE_NAME,
} from "@/lib/site";
