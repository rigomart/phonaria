/**
 * Memoizes an async load so concurrent callers share one request, while
 * leaving failures retryable: a rejection clears the cache instead of being
 * remembered forever. Caching a rejected promise would make any "Retry"
 * affordance a no-op for the rest of the tab's life (#144).
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
