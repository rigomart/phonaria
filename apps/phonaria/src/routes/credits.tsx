import { createFileRoute } from "@tanstack/react-router";
import { CreditsContent } from "@/components/credits-content";
import { buildCreditsHead } from "@/lib/document-head";
import { flags } from "@/lib/flags";

export const Route = createFileRoute("/credits")({
	head: () => buildCreditsHead(),
	component: CreditsRoute,
});

function CreditsRoute() {
	return <CreditsContent flags={flags.snapshot()} />;
}
