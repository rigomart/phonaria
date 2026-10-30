import { createFileRoute } from "@tanstack/react-router";
import { contrastPageHref } from "@/lib/minimal-pairs";
import { redirect } from "@/lib/navigation";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { validateMinimalPairSearch } from "@/practice/_lib/minimal-pair-prompt";

/**
 * Redirects links shared before the page left Practice, straight to the
 * contrast's page. The trailing underscore keeps it outside the /practice
 * layout, so FLAG_PRACTICE does not gate it.
 */
export const Route = createFileRoute("/practice_/minimal-pairs")({
	beforeLoad: ({ location }) => {
		const { contrast, word } = validateMinimalPairSearch(location.search);
		redirect(contrast ? contrastPageHref(contrast, word) : MinimalPairActivity.path, 308);
	},
});
