import { createFileRoute } from "@tanstack/react-router";
import { PracticeIndexContent } from "@/app/practice/_components/practice-index-content";
import { buildPracticeIndexHead } from "@/platform/tanstack";

export const Route = createFileRoute("/practice/")({
	head: () => buildPracticeIndexHead(),
	component: PracticeIndexRoute,
});

function PracticeIndexRoute() {
	return <PracticeIndexContent />;
}
