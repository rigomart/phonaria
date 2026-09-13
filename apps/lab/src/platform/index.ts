/**
 * Stable Lab platform API. Next.js adapters live in `./next` and are the
 * temporary migration boundary for TanStack Start.
 */
export { FONT_PRELOADS, NOTO_SANS_PRELOAD_HREF } from "./fonts";
export { type AppImageProps, Image, imageClassName } from "./image";
export { type AppLinkProps, Link } from "./next/link";
export { notFound, redirect } from "./next/navigation";
export { requireFlag } from "./next/require-flag";
export {
	getDocumentMetadata,
	getGoogleSiteVerification,
	getPublicAssetBaseUrl,
	getSiteUrl,
	isIndexingEnabled,
	SITE_DESCRIPTION,
	SITE_NAME,
} from "./runtime-config";
