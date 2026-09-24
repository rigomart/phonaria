/**
 * Prefer a new env var name, then fall back to its Lab-era name during the
 * #257 GitHub settings cutover.
 */
export function readPreferredEnv(
	env: NodeJS.Dict<string | undefined>,
	preferred: string,
	fallback: string,
): string | undefined {
	const next = env[preferred]?.trim();
	if (next) return next;
	const previous = env[fallback]?.trim();
	if (previous) return previous;
	return undefined;
}
