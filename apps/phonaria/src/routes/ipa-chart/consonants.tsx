import { createFileRoute } from "@tanstack/react-router";
import { ConsonantsContent } from "@/components/ipa-chart/consonants-content";
import { buildConsonantsHead } from "@/lib/document-head";

export const Route = createFileRoute("/ipa-chart/consonants")({
	head: () => buildConsonantsHead(),
	component: ConsonantsRoute,
});

function ConsonantsRoute() {
	return <ConsonantsContent />;
}
