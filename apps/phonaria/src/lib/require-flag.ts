/**
 * TanStack Start adapter for environment-backed feature flags.
 * Disabled flags throw the framework not-found helper so gated routes stay 404.
 */
import type { AppFlags } from "@/lib/flags";
import { flags } from "@/lib/flags";
import { notFound } from "./navigation";

export function requireFlag(name: keyof AppFlags): void {
	if (!flags.isEnabled(name)) notFound();
}
