/**
 * Env-backed feature flags. Each flag reads a single env var so modules can
 * ship to production dark and be enabled per Vercel environment.
 *
 * Values are read at build time for statically generated routes, so flipping a
 * flag on Vercel requires a redeploy.
 */
const FlagDefinitions = {
	practice: {
		envVar: "FLAG_PRACTICE",
		// Unreleased modules stay visible locally but hidden in production
		// builds until the env var opts them in.
		enabledByDefault: process.env.NODE_ENV !== "production",
	},
} as const;

export type FlagName = keyof typeof FlagDefinitions;

export function isFlagEnabled(name: FlagName): boolean {
	const { envVar, enabledByDefault } = FlagDefinitions[name];
	const raw = process.env[envVar];
	if (raw === undefined || raw === "") return enabledByDefault;
	return raw === "1" || raw.toLowerCase() === "true";
}
