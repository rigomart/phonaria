import { createFileRoute } from "@tanstack/react-router";
import { WordPageContent } from "@/components/word-pages/word-page-content";
import { buildWordHead } from "@/lib/document-head";
import { notFound, redirect } from "@/lib/navigation";
import { findWordPagePath, hasWordPage } from "@/lib/word-pages";

export const Route = createFileRoute("/words/$word")({
	beforeLoad: ({ params }) => {
		if (hasWordPage(params.word)) return;
		const path = findWordPagePath(params.word);
		if (path) redirect(path, 308);
		notFound();
	},
	// A dynamic import, so the bundles of the app's other pages leave the page data out.
	loader: async ({ params }) => {
		const { getWordPageView, wordPageHeadText } = await import("@/lib/word-page-content");
		const view = getWordPageView(params.word);
		if (!view) notFound();
		return { view, head: wordPageHeadText(view) };
	},
	head: ({ loaderData }) => buildWordHead(loaderData?.head),
	component: WordRoute,
});

function WordRoute() {
	const { view } = Route.useLoaderData();
	return <WordPageContent key={view.word} view={view} />;
}
