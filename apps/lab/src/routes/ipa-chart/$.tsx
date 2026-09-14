import { createFileRoute } from "@tanstack/react-router";
import { notFound } from "@/platform/tanstack";

/**
 * Unknown chart and articulation paths must render the Lab not-found page
 * instead of a generic Worker failure.
 */
export const Route = createFileRoute("/ipa-chart/$")({
	beforeLoad: () => {
		notFound();
	},
});
