import { createFileRoute } from "@tanstack/react-router";
import { buildMinimalPairsHead } from "@/lib/document-head";
import { contrastPageHref } from "@/lib/minimal-pairs";
import { redirect } from "@/lib/navigation";
import { ContrastPicker } from "@/practice/_components/contrast-picker";
import { validateMinimalPairSearch } from "@/practice/_lib/minimal-pair-prompt";

/** Redirects legacy `?contrast=th-s` links to that contrast's page. */
export const Route = createFileRoute("/minimal-pairs/")({
	validateSearch: validateMinimalPairSearch,
	beforeLoad: ({ search }) => {
		// `search` here still carries keys the validator dropped, so an unknown contrast is checked again.
		const { contrast, word } = validateMinimalPairSearch(search);
		if (contrast) redirect(contrastPageHref(contrast, word), 308);
	},
	head: () => buildMinimalPairsHead(),
	component: ContrastPicker,
});
