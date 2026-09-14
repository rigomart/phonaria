import { createFlags } from "@phonaria/flags";

/**
 * Lab feature flags. Framework-neutral registry — route gates live in
 * `src/platform/next/require-flag.ts` and `src/platform/tanstack/require-flag.ts`.
 * See packages/flags/README.md.
 *
 * Values are baked in at build time from `process.env` (Wrangler `vars`
 * flattened via `CLOUDFLARE_ENV`), so flipping a flag requires a redeploy.
 */
export const flags = createFlags({
	practice: {
		envVar: "FLAG_PRACTICE",
		// Unreleased modules stay visible locally but hidden in production
		// builds until the env var opts them in.
		enabledByDefault: process.env.NODE_ENV !== "production",
	},
});

export type LabFlags = ReturnType<typeof flags.snapshot>;
