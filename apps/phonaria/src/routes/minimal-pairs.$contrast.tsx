import { createFileRoute } from "@tanstack/react-router";
import { buildMinimalPairContrastHead } from "@/lib/document-head";
import { getContrastPage } from "@/lib/minimal-pairs";
import { notFound } from "@/lib/navigation";
import { ContrastPageView } from "@/practice/_components/contrast-page";

export const Route = createFileRoute("/minimal-pairs/$contrast")({
	validateSearch: (search: Record<string, unknown>): { word?: string } =>
		typeof search.word === "string" ? { word: search.word } : {},
	beforeLoad: ({ params }) => {
		if (!getContrastPage(params.contrast)) notFound();
	},
	head: ({ params }) => buildMinimalPairContrastHead(getContrastPage(params.contrast)),
	component: ContrastRoute,
});

function ContrastRoute() {
	const { contrast } = Route.useParams();
	const { word } = Route.useSearch();
	const page = getContrastPage(contrast);
	return page ? <ContrastPageView page={page} word={word} /> : null;
}
