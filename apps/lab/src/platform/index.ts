/**
 * Framework-neutral Lab platform API.
 *
 * Next.js adapters live in `./next`. TanStack Start adapters live in
 * `./tanstack`. This barrel must not import `next/*` or `next-themes`.
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
