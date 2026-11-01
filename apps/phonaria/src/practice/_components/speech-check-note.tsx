import { Disclaimer } from "@/components/disclaimer";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";

export function SpeechCheckNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="How your recording is checked"
			points={[
				"Your recording goes to Microsoft Azure AI Speech, which scores each sound and writes down the word it heard.",
				"Background noise or a quiet microphone can make the check mishear you. If a result seems wrong, try again.",
				"Phonaria keeps your results only if you turn on sharing below.",
			]}
			sources={[{ key: "speech-scoring", label: "Microsoft Azure AI Speech" }]}
		>
			{MinimalPairActivity.speechCheckNotice}
		</Disclaimer>
	);
}
