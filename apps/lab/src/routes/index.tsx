import { createFileRoute } from "@tanstack/react-router";
import { TranscriptionJourney } from "@/components/transcription/transcription-journey";
import { buildHomeHead } from "@/platform/tanstack";
import { transcribeWordsFromStart } from "@/server/transcribe";

export const Route = createFileRoute("/")({
	head: () => buildHomeHead(),
	component: HomeRoute,
});

function HomeRoute() {
	return <TranscriptionJourney transcribeWords={transcribeWordsFromStart} />;
}
