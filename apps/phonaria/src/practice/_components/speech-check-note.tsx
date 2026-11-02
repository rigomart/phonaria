import { Disclaimer } from "@/components/disclaimer";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";

export function SpeechCheckNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="About this check"
			points={[
				"Your recording goes to Microsoft's speech service, Azure AI Speech.",
				"It scores each sound and writes down the word it heard.",
				"Background noise or a low microphone volume can make it hear the wrong word or sound. If a result looks wrong, try again.",
				"Your results are kept only if you turn on the sharing switch below.",
			]}
			source="speech-scoring"
		>
			{MinimalPairActivity.speechCheckNotice}
		</Disclaimer>
	);
}
