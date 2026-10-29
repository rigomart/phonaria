import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@/lib/navigation";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";

/**
 * Redirects links shared before the page left Practice. The trailing underscore
 * keeps it outside the /practice layout, so FLAG_PRACTICE does not gate it.
 */
export const Route = createFileRoute("/practice_/minimal-pairs")({
	beforeLoad: ({ location }) => {
		redirect(`${MinimalPairActivity.path}${location.searchStr}`, 308);
	},
});
