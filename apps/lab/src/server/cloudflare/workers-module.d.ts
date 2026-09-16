declare module "cloudflare:workers" {
	export const env: {
		SITE_URL?: string;
		SITE_INDEXING_ENABLED?: string;
		FLAG_PRACTICE?: string;
		PUBLIC_BUCKET_URL?: string;
		TURSO_DATABASE_URL?: string;
		TURSO_AUTH_TOKEN?: string;
		TRANSCRIPTION_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
	};
}
