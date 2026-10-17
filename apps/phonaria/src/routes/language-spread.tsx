import { createFileRoute } from "@tanstack/react-router";
import { LanguageSpreadContent } from "@/components/language-spread/language-spread-content";
import { buildLanguageSpreadHead } from "@/lib/document-head";
import { requireFlag } from "@/lib/require-flag";

export const Route = createFileRoute("/language-spread")({
	beforeLoad: () => {
		requireFlag("languageSpread");
	},
	head: () => buildLanguageSpreadHead(),
	component: LanguageSpreadContent,
});
