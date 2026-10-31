import { createFileRoute } from "@tanstack/react-router";
import { ABOUT_VARIANTS, AboutContent, type AboutVariant } from "@/components/about/about-content";
import { buildAboutHead } from "@/lib/document-head";
import { flags } from "@/lib/flags";

function isVariant(value: unknown): value is AboutVariant {
	return ABOUT_VARIANTS.some((v) => v.id === value);
}

export const Route = createFileRoute("/about")({
	validateSearch: (search: Record<string, unknown>): { variant?: AboutVariant } =>
		isVariant(search.variant) ? { variant: search.variant } : {},
	head: () => buildAboutHead(),
	component: AboutRoute,
});

function AboutRoute() {
	const { variant = "a" } = Route.useSearch();
	return <AboutContent variant={variant} flags={flags.snapshot()} />;
}
