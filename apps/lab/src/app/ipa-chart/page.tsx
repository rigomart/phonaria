import { IPA_CHART_CONSONANTS_PATH } from "@/lib/ipa-chart-metadata";
import { redirect } from "@/platform/next";

export default function IpaChartPage() {
	redirect(IPA_CHART_CONSONANTS_PATH);
}
