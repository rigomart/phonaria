import { createFileRoute } from "@tanstack/react-router";
import { VowelsContent } from "@/components/ipa-chart/vowels-content";
import { buildVowelsHead } from "@/lib/document-head";

export const Route = createFileRoute("/ipa-chart/vowels")({
	head: () => buildVowelsHead(),
	component: VowelsRoute,
});

function VowelsRoute() {
	return <VowelsContent />;
}
