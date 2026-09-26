import { createFileRoute } from "@tanstack/react-router";
import { TranscriptionJourney } from "@/components/transcription/transcription-journey";
import { buildHomeHead } from "@/lib/document-head";
import { validateTranscriptionSearch } from "@/lib/transcription/search";
import { chooseSpellingInContextFromStart } from "@/server/choose-spelling";
import { transcribeWordsFromStart } from "@/server/transcribe";

export const Route = createFileRoute("/")({
	validateSearch: validateTranscriptionSearch,
	head: () => buildHomeHead(),
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<TranscriptionJourney
			transcribeWords={transcribeWordsFromStart}
			chooseSpellingInContext={chooseSpellingInContextFromStart}
		/>
	);
}
