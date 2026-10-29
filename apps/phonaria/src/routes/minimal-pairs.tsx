import { createFileRoute } from "@tanstack/react-router";
import { buildMinimalPairPracticeHead } from "@/lib/document-head";
import { requireFlag } from "@/lib/require-flag";
import { MinimalPairPractice } from "@/practice/_components/minimal-pair-practice";
import { validateMinimalPairSearch } from "@/practice/_lib/minimal-pair-prompt";

export const Route = createFileRoute("/minimal-pairs")({
	validateSearch: validateMinimalPairSearch,
	beforeLoad: () => {
		requireFlag("speech");
	},
	head: () => buildMinimalPairPracticeHead(),
	component: MinimalPairPracticeRoute,
});

function MinimalPairPracticeRoute() {
	return <MinimalPairPractice search={Route.useSearch()} />;
}
