declare module "cloudflare:workers" {
	export const env: {
		SITE_URL?: string;
		SITE_INDEXING_ENABLED?: string;
		FLAG_PRACTICE?: string;
		PUBLIC_BUCKET_URL?: string;
		TURSO_DATABASE_URL?: string;
		TURSO_AUTH_TOKEN?: string;
	};
}
