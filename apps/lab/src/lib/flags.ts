import { createFlags } from "@phonaria/flags";
import { notFound } from "next/navigation";

/**
 * Lab feature flags. See packages/flags/README.md for conventions; values are
 * baked in at build time for statically generated routes, so flipping a flag
 * on Vercel requires a redeploy.
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

/** Call from a route layout to 404 the whole route group while its flag is off. */
export function requireFlag(name: keyof LabFlags): void {
	if (!flags.isEnabled(name)) notFound();
}
