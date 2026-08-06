/**
 * Env-backed feature flags so modules can ship to production dark and be
 * enabled per environment. Framework-agnostic: apps declare their own
 * registry with `createFlags` and decide how to gate routes and UI.
 *
 * Values come from `process.env`, so for statically generated routes a flag
 * is baked in at build time and flipping it requires a redeploy.
 */

export interface FlagDefinition {
	/** Environment variable that controls the flag, e.g. "FLAG_PRACTICE". */
	envVar: string;
	/** Value used when the env var is unset or empty. */
	enabledByDefault: boolean;
}

export interface FlagRegistry<TName extends string> {
	isEnabled(name: TName): boolean;
	/** Plain object of every flag's current value, safe to pass to client components. */
	snapshot(): Record<TName, boolean>;
}

export function createFlags<TName extends string>(
	definitions: Record<TName, FlagDefinition>,
): FlagRegistry<TName> {
	function isEnabled(name: TName): boolean {
		const { envVar, enabledByDefault } = definitions[name];
		const raw = process.env[envVar];
		if (raw === undefined || raw === "") return enabledByDefault;
		return raw === "1" || raw.toLowerCase() === "true";
	}

	function snapshot(): Record<TName, boolean> {
		const names = Object.keys(definitions) as TName[];
		return Object.fromEntries(names.map((name) => [name, isEnabled(name)])) as Record<
			TName,
			boolean
		>;
	}

	return { isEnabled, snapshot };
}
