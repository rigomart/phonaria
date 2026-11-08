/**
 * Shared security-header policy for TanStack Start and Cloudflare assets.
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

export const STRICT_TRANSPORT_SECURITY = "max-age=31536000";

/** `clipboard-write` is left at the browser default (this origin), which copying IPA needs. */
export const PERMISSIONS_POLICY = "microphone=(self), camera=(), geolocation=()";

/** Read by both the request middleware and the `_headers` file. */
export function getSecurityHeaders(
	policy: string = getContentSecurityPolicy(),
): ReadonlyArray<readonly [name: string, value: string]> {
	return [
		["Content-Security-Policy", policy],
		["Strict-Transport-Security", STRICT_TRANSPORT_SECURITY],
		["X-Content-Type-Options", "nosniff"],
		["Referrer-Policy", "strict-origin-when-cross-origin"],
		["Permissions-Policy", PERMISSIONS_POLICY],
	];
}

/** Vite content-hashes everything under this path, so it is safe to cache forever. */
export const HASHED_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * Cloudflare Static Assets `_headers` file so prerendered HTML keeps the
 * security headers and hashed assets are not revalidated on every warm load.
 */
export function formatCloudflareHeadersFile(policy: string = getContentSecurityPolicy()): string {
	const headers = getSecurityHeaders(policy)
		.map(([name, value]) => `  ${name}: ${value}\n`)
		.join("");
	return `/*\n${headers}\n/assets/*\n  Cache-Control: ${HASHED_ASSET_CACHE_CONTROL}\n`;
}
