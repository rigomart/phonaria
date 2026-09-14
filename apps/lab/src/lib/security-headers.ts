/**
 * Shared security-header policy for Next.js and TanStack Start.
 * Keep this the source of truth so the two runtimes cannot drift.
 *
 * Host matches `next.config.ts` `images.remotePatterns`.
 */

export const ASSET_BUCKET_HOST = "assets.rigos.dev";
export const ASSET_BUCKET_ORIGIN = `https://${ASSET_BUCKET_HOST}`;

export function getContentSecurityPolicy(): string {
	return [
		"default-src 'self'",
		"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		`img-src 'self' blob: data: ${ASSET_BUCKET_ORIGIN}`,
		"font-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests",
		`media-src 'self' ${ASSET_BUCKET_ORIGIN}`,
	].join("; ");
}

/** Vite content-hashes everything under this path, so it is safe to cache forever. */
export const HASHED_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * Cloudflare Static Assets `_headers` file so prerendered HTML keeps CSP and
 * hashed assets are not revalidated on every warm load.
 */
export function formatCloudflareHeadersFile(policy: string = getContentSecurityPolicy()): string {
	return `/*\n  Content-Security-Policy: ${policy}\n\n/assets/*\n  Cache-Control: ${HASHED_ASSET_CACHE_CONTROL}\n`;
}
