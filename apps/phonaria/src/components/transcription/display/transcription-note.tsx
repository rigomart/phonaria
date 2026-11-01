import { Disclaimer } from "@/components/disclaimer";

export function TranscriptionNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="About these pronunciations"
			points={[
				"Each word is looked up in the CMU Pronouncing Dictionary, which lists General American pronunciations. Any one speaker, American or not, may say a word differently.",
				"Words the dictionary doesn't have show as Not found. Phonaria doesn't guess their sounds.",
				"Phonaria splits words into syllables and turns the dictionary's sound codes into IPA itself, so mistakes there are Phonaria's.",
				"When a word isn't in the dictionary, the text you typed may go to an AI model, Jev, through OpenRouter, to suggest the word you meant.",
				"Definitions come from Wiktionary when you open a word, shortened to a few meanings.",
			]}
			sources={[
				{ key: "cmu", label: "CMU Pronouncing Dictionary" },
				{ key: "jev", label: "Jev" },
				{ key: "wiktionary", label: "Wiktionary" },
			]}
		>
			Pronunciations come from one US dictionary, so they won't match every speaker.
		</Disclaimer>
	);
}
