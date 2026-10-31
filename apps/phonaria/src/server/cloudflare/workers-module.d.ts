declare module "cloudflare:workers" {
	export const env: {
		SITE_URL?: string;
		SITE_INDEXING_ENABLED?: string;
		FLAG_PRACTICE?: string;
		FLAG_LANGUAGE_HISTORY?: string;
		FLAG_ABOUT?: string;
		FLAG_SPEECH?: string;
		PUBLIC_BUCKET_URL?: string;
		TURSO_DATABASE_URL?: string;
		TURSO_AUTH_TOKEN?: string;
		OPENROUTER_API_KEY?: string;
		AZURE_SPEECH_KEY?: string;
		AZURE_SPEECH_REGION?: string;
		EVIDENCE_LOG_DATABASE_URL?: string;
		EVIDENCE_LOG_AUTH_TOKEN?: string;
		TRANSCRIPTION_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
		DEFINITION_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
		SPELLING_CONTEXT_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
		SPEECH_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
		EVIDENCE_LOG_RATE_LIMIT: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
	};
}
