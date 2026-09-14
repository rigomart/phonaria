import { createFileRoute } from "@tanstack/react-router";
import { CreditsContent } from "@/components/credits-content";
import { buildCreditsHead } from "@/platform/tanstack";

export const Route = createFileRoute("/credits")({
	head: () => buildCreditsHead(),
	component: CreditsRoute,
});

function CreditsRoute() {
	return <CreditsContent />;
}
