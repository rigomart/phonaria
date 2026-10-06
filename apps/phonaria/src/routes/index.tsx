import { createFileRoute } from "@tanstack/react-router";
import { TranscriptionJourney } from "@/components/transcription/transcription-journey";
import { buildHomeHead } from "@/lib/document-head";
import { homeIntroFontPreloads } from "@/lib/fonts";
import { validateTranscriptionSearch } from "@/lib/transcription/search";
import { chooseSpellingInContextFromStart } from "@/server/choose-spelling";
import { transcribeWordsFromStart } from "@/server/transcribe";

export const Route = createFileRoute("/")({
	validateSearch: validateTranscriptionSearch,
	head: () => {
		const head = buildHomeHead();
		return { ...head, links: [...(head.links ?? []), ...homeIntroFontPreloads] };
	},
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
