import { Disclaimer } from "@/components/disclaimer";

export function TranscriptionNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="About these pronunciations"
			points={[
				"Sounds come from the CMU Pronouncing Dictionary, which lists US English pronunciations.",
				"Its pronunciations follow one common US accent. People in the US and elsewhere may say a word differently.",
				'Words that aren\'t in the dictionary show as "Not found", with no guess at how they sound.',
				'If a word shows as "Not found", what you typed may be sent to an AI model to suggest a spelling.',
				"The AI model is Jev, used through OpenRouter.",
				"The syllable breaks and IPA symbols are added afterwards, not taken from the dictionary, so mistakes in them aren't the dictionary's.",
				"When you click a word, its meanings come from Wiktionary. Only a few show.",
			]}
			source="cmu"
		>
			Pronunciations come from one US dictionary, but people say words in different ways.
		</Disclaimer>
	);
}
