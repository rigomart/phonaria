import { createFileRoute } from "@tanstack/react-router";
import { buildMinimalPairPracticeHead } from "@/lib/document-head";
import { requireFlag } from "@/lib/require-flag";
import { MinimalPairPractice } from "@/practice/_components/minimal-pair-practice";
import { validateMinimalPairSearch } from "@/practice/_lib/minimal-pair-prompt";

/**
 * Outside the /practice layout (the trailing underscore), so FLAG_SPEECH alone
 * gates it and FLAG_PRACTICE's topic flow can stay off.
 */
export const Route = createFileRoute("/practice_/minimal-pairs")({
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
