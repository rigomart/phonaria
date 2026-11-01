import { Disclaimer } from "@/components/disclaimer";

export function TranscriptionNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="About these pronunciations"
			points={[
				"Sounds come from the CMU Pronouncing Dictionary, which lists US English pronunciations.",
				"Its pronunciations follow one common US accent. People in the US and elsewhere may say a word differently.",
				"Words that aren't in the dictionary show as \"Not found\". We don't guess how they sound.",
				'If a word shows as "Not found", we may send what you typed to an AI model to suggest a spelling.',
				"The AI model is Jev, used through OpenRouter.",
				"We add the syllable breaks and IPA symbols ourselves. Mistakes in them are ours.",
				"When you click a word, its meanings come from Wiktionary. We show only a few.",
			]}
			source="cmu"
		>
			Pronunciations come from one US dictionary, but people say words in different ways.
		</Disclaimer>
	);
}
