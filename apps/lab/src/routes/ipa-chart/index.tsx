import { createFileRoute } from "@tanstack/react-router";
import { IPA_CHART_CONSONANTS_PATH } from "@/lib/ipa-chart-metadata";
import { redirect } from "@/platform/tanstack";

export const Route = createFileRoute("/ipa-chart/")({
	beforeLoad: () => {
		redirect(IPA_CHART_CONSONANTS_PATH);
	},
});
