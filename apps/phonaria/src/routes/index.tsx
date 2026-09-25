import { createFileRoute } from "@tanstack/react-router";
import { TranscriptionJourney } from "@/components/transcription/transcription-journey";
import { buildHomeHead } from "@/lib/document-head";
import { flags } from "@/lib/flags";
import { chooseSpellingInContextFromStart } from "@/server/choose-spelling";
import { transcribeWordsFromStart } from "@/server/transcribe";

export const Route = createFileRoute("/")({
	head: () => buildHomeHead(),
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<TranscriptionJourney
			transcribeWords={transcribeWordsFromStart}
			chooseSpellingInContext={
				flags.isEnabled("spellingContext") ? chooseSpellingInContextFromStart : undefined
			}
		/>
	);
}
