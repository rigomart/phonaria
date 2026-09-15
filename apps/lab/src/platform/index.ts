/**
 * Framework-neutral Lab platform API. TanStack Start adapters live in
 * `./tanstack`; this barrel must not import framework implementations.
 */
export { type AppImageProps, Image, imageClassName } from "./image";
export {
	getDocumentMetadata,
	getGoogleSiteVerification,
	getPublicAssetBaseUrl,
	getSiteUrl,
	isIndexingEnabled,
	SITE_DESCRIPTION,
	SITE_NAME,
} from "./runtime-config";
