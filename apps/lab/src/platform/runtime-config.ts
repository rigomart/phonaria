/**
 * Framework-neutral runtime configuration for the Lab shell.
 * Values come from process.env so TanStack Start and Worker bindings can
 * supply them.
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
