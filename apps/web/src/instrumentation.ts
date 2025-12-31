export async function register() {
	// Import server client which has side effects:
	// - Sets globalThis.$orpcClient
	// - Enables SSR optimization with direct procedure calls
	await import("./lib/orpc/server");
}
