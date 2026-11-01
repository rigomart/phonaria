import { createFileRoute } from "@tanstack/react-router";
import { SearchJourney } from "@/components/transcription/transcription-journey";
import { buildSearchHead } from "@/lib/document-head";
import { redirect } from "@/lib/navigation";
import { validateTranscriptionSearch } from "@/lib/transcription/search";
import { chooseSpellingInContextFromStart } from "@/server/choose-spelling";
import { transcribeWordsFromStart } from "@/server/transcribe";

export const Route = createFileRoute("/search")({
	validateSearch: validateTranscriptionSearch,
	beforeLoad: ({ search }) => {
		if (search.q === undefined && search.sounds === undefined) redirect("/");
	},
	head: ({ match }) => buildSearchHead(match.search),
	component: SearchRoute,
});

function SearchRoute() {
	return (
		<SearchJourney
			transcribeWords={transcribeWordsFromStart}
			chooseSpellingInContext={chooseSpellingInContextFromStart}
		/>
	);
}
