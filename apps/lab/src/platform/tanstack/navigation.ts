/**
 * TanStack Start adapter for route-level navigation outcomes.
 */
import { notFound as tanstackNotFound, redirect as tanstackRedirect } from "@tanstack/react-router";

export function notFound(): never {
	throw tanstackNotFound();
}

export function redirect(to: string): never {
	throw tanstackRedirect({ href: to });
}
