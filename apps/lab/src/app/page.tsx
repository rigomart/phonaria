import { TranscriptionJourney } from "@/components/transcription/transcription-journey";
import { transcribeWordsAction } from "./_actions/transcribe";

export default function HomePage() {
	return <TranscriptionJourney transcribeWords={transcribeWordsAction} />;
}
