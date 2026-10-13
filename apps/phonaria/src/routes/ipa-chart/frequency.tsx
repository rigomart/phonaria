import { createFileRoute } from "@tanstack/react-router";
import { FrequencyContent } from "@/components/ipa-chart/frequency-content";
import { buildFrequencyHead } from "@/lib/document-head";

export const Route = createFileRoute("/ipa-chart/frequency")({
	head: () => buildFrequencyHead(),
	component: FrequencyRoute,
});

function FrequencyRoute() {
	return <FrequencyContent />;
}
