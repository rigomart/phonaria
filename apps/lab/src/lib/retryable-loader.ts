/**
 * Memoizes an async load so concurrent callers share one request, but clears
 * the cache on rejection — remembering a failure would make any Retry a no-op
 * for the rest of the tab's life.
 */
export function createRetryableLoader<T>(load: () => Promise<T>): () => Promise<T> {
	let pending: Promise<T> | null = null;

	return () => {
		if (!pending) {
			pending = load().catch((error: unknown) => {
				pending = null;
				throw error;
			});
		}
		return pending;
	};
}
