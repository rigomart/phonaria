import { createFileRoute, defaultStringifySearch } from "@tanstack/react-router";
import { HomeJourney } from "@/components/transcription/transcription-journey";
import { buildHomeHead } from "@/lib/document-head";
import { homeIntroFontPreloads } from "@/lib/fonts";
import { SEARCH_PATH } from "@/lib/home-metadata";
import { redirect } from "@/lib/navigation";
import { normalizeTranscriptionQuery } from "@/lib/transcription/search";
import { chooseSpellingInContextFromStart } from "@/server/choose-spelling";
import { transcribeWordsFromStart } from "@/server/transcribe";

export const Route = createFileRoute("/")({
	// Links already shared as /?q=hello still open their search.
	// defaultStringifySearch quotes text that looks like JSON ("null", "1e3"), so it reads back as the same text.
	beforeLoad: ({ location }) => {
		const query = normalizeTranscriptionQuery((location.search as Record<string, unknown>).q);
		if (query !== undefined) {
			redirect(`${SEARCH_PATH}${defaultStringifySearch({ q: query })}`, 308);
		}
	},
	head: () => {
		const head = buildHomeHead();
		return { ...head, links: [...(head.links ?? []), ...homeIntroFontPreloads] };
	},
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<HomeJourney
			transcribeWords={transcribeWordsFromStart}
			chooseSpellingInContext={chooseSpellingInContextFromStart}
		/>
	);
}
