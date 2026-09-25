import { createFlags } from "@phonaria/flags";

/**
 * Application feature flags. Route gates live in
 * `src/lib/require-flag.ts`.
 * See packages/flags/README.md.
 *
 * Values are baked in at build time from `process.env` (Wrangler `vars`
 * flattened via `CLOUDFLARE_ENV`), so flipping a flag requires a redeploy.
 */
export const flags = createFlags(
	{
		practice: {
			envVar: "FLAG_PRACTICE",
			// Unreleased modules stay visible locally but hidden in production
			// builds until the env var opts them in.
			enabledByDefault: process.env.NODE_ENV !== "production",
		},
		spellingContext: {
			envVar: "FLAG_SPELLING_CONTEXT",
			// Sends learner text to Jev through OpenRouter; stays dark in production until
			// the eval in scripts/eval-spelling-context.ts passes.
			enabledByDefault: process.env.NODE_ENV !== "production",
		},
	},
	{
		// Live getter so unit tests can still flip FLAG_PRACTICE. Vite replaces
		// the static `process.env.FLAG_PRACTICE` access at build time;
		// dynamic `process.env[name]` is not replaced and caused a hydration
		// mismatch (SSR saw Worker vars, the client hid Practice in the nav).
		get FLAG_PRACTICE() {
			return process.env.FLAG_PRACTICE;
		},
		get FLAG_SPELLING_CONTEXT() {
			return process.env.FLAG_SPELLING_CONTEXT;
		},
	},
);

export type AppFlags = ReturnType<typeof flags.snapshot>;
