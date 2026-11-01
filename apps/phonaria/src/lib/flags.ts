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
		languageHistory: {
			envVar: "FLAG_LANGUAGE_HISTORY",
			enabledByDefault: process.env.NODE_ENV !== "production",
		},
		about: {
			envVar: "FLAG_ABOUT",
			// Off everywhere the var is unset, local dev included; set FLAG_ABOUT=1 to see it.
			enabledByDefault: false,
		},
		speech: {
			envVar: "FLAG_SPEECH",
			enabledByDefault: process.env.NODE_ENV !== "production",
		},
		soundSearch: {
			envVar: "FLAG_SOUND_SEARCH",
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
		get FLAG_LANGUAGE_HISTORY() {
			return process.env.FLAG_LANGUAGE_HISTORY;
		},
		get FLAG_ABOUT() {
			return process.env.FLAG_ABOUT;
		},
		get FLAG_SPEECH() {
			return process.env.FLAG_SPEECH;
		},
		get FLAG_SOUND_SEARCH() {
			return process.env.FLAG_SOUND_SEARCH;
		},
	},
);

export type AppFlags = ReturnType<typeof flags.snapshot>;
