import { createFileRoute } from "@tanstack/react-router";
import { IPA_CHART_CONSONANTS_PATH } from "@/lib/ipa-chart-metadata";
import { redirect } from "@/lib/navigation";

export const Route = createFileRoute("/ipa-chart/")({
	beforeLoad: () => {
		redirect(IPA_CHART_CONSONANTS_PATH);
	},
});
