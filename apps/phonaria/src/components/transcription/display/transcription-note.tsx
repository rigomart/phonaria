import { Disclaimer } from "@/components/disclaimer";

export function TranscriptionNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="About these pronunciations"
			points={[
				"Sounds come from the CMU Pronouncing Dictionary, which follows one common US accent. People in the US and elsewhere may say a word differently.",
				'Words that aren\'t in the dictionary show as "Not found", with no guess at how they sound.',
				'If a word shows as "Not found", what you typed may be sent to an AI model to suggest a spelling.',
			]}
			source="cmu"
		/>
	);
}
