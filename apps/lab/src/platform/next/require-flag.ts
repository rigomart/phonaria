/**
 * Next.js adapter for environment-backed feature flags.
 * Disabled flags call the framework not-found helper so gated routes stay 404.
 */
import type { LabFlags } from "@/lib/flags";
import { flags } from "@/lib/flags";
import { notFound } from "./navigation";

export function requireFlag(name: keyof LabFlags): void {
	if (!flags.isEnabled(name)) notFound();
}
