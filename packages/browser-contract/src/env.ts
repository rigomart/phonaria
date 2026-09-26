/** Read a non-empty environment value. */
export function readEnv(env: NodeJS.Dict<string | undefined>, key: string): string | undefined {
	return env[key]?.trim() || undefined;
}

/** Match the opt-in flags used by the browser contract. */
export function isFlagEnabled(env: NodeJS.Dict<string | undefined>, key: string): boolean {
	const value = readEnv(env, key);
	return value === "1" || value === "true";
}
