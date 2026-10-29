import { createFileRoute } from "@tanstack/react-router";
import { LanguageHistoryContent } from "@/components/language-history/language-history-content";
import { buildLanguageHistoryHead } from "@/lib/document-head";
import { requireFlag } from "@/lib/require-flag";

export const Route = createFileRoute("/history")({
	beforeLoad: () => {
		requireFlag("languageHistory");
	},
	head: () => buildLanguageHistoryHead(),
	component: LanguageHistoryContent,
});
