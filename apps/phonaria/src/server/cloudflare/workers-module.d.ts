declare module "cloudflare:workers" {
	export const env: {
		SITE_URL?: string;
		SITE_INDEXING_ENABLED?: string;
		FLAG_PRACTICE?: string;
		FLAG_SPELLING_CONTEXT?: string;
		PUBLIC_BUCKET_URL?: string;
		TURSO_DATABASE_URL?: string;
		TURSO_AUTH_TOKEN?: string;
		OPENROUTER_API_KEY?: string;
		TRANSCRIPTION_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
		DEFINITION_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
		SPELLING_CONTEXT_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
	};
}
