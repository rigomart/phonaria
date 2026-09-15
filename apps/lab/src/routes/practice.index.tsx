import { createFileRoute } from "@tanstack/react-router";
import { buildPracticeIndexHead } from "@/lib/document-head";
import { PracticeIndexContent } from "@/practice/_components/practice-index-content";

export const Route = createFileRoute("/practice/")({
	head: () => buildPracticeIndexHead(),
	component: PracticeIndexRoute,
});

function PracticeIndexRoute() {
	return <PracticeIndexContent />;
}
