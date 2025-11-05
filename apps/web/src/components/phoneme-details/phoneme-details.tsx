"use client";

import type { PhonemeSymbolId } from "shared-data/src/phonetics/symbols-registry";
import { cn } from "@/lib/utils";
import { PhonemeDetailsProvider } from "./phoneme-details-context";

const MOCK_DATA = {
	slug: "voiceless-dental-fricative",
	symbol: "θ",
	description: "Voiceless dental fricative",
	audioUrl: "https://assets.rigos.dev/phoneme-examples/about.mp3",
	articulation: {
		illustration: {
			url: "https://assets.rigos.dev/diagrams/Voiceless_dental_fricative_articulation%201.svg",
			alt: "Voiceless dental fricative articulation",
		},
		features: {
			manner: "fricative",
			place: "dental",
			voicing: "voiceless",
		},
	},
	steps: [
		"Tongue tip between teeth",
		"Teeth should be slightly apart",
		"Blow air gently through the gap",
	],
	pitfalls: [
		{
			summary: "Tongue too far back",
			tip: "Keep your tongue tip between your front teeth, not against the alveolar ridge. The position matters more than the airflow.",
		},
		{
			summary: "Articulating with the lips",
			tip: "/θ/ uses your tongue against your teeth, while /f/ uses your lower lip against your upper teeth. Feel the difference.",
		},
	],
	examples: {
		patterns: ["th"],
		words: [
			{
				grapheme: {
					chars: ["t", "h", "i", "n", "k"],
					highlight: [0, 1],
				},
				phonemic: {
					chars: ["θ", "ɪ", "ŋ", "k"],
					highlight: [0],
				},
				audioUrl: "https://assets.rigos.dev/phoneme-examples/ahead.mp3",
			},
			{
				grapheme: {
					chars: ["m", "o", "n", "t", "h"],
					highlight: [3, 4],
				},
				phonemic: {
					chars: ["m", "ʌ", "n", "θ"],
					highlight: [3],
				},
				audioUrl: "https://assets.rigos.dev/phoneme-examples/ahead.mp3",
			},
		],
	},

	contrasts: [
		{
			partner: "ð",
			category: "Voicing",
			summary: "Voiceless /θ/ vs voiced /ð/—only the voicing changes",
			pairs: [
				{ word: "think", transcription: "θɪŋk", audioUrl: "/audio/examples/think.mp3" },
				{ word: "this", transcription: "ðɪs", audioUrl: "/audio/examples/this.mp3" },
			],
		},
		{
			partner: "s",
			category: "Place",
			summary: "Contrast dental /θ/ with alveolar /s/—tongue position differs",
			pairs: [
				{ word: "think", transcription: "θɪŋk", audioUrl: "/audio/examples/think.mp3" },
				{ word: "sink", transcription: "sɪŋk", audioUrl: "/audio/examples/sink.mp3" },
			],
		},
	],
	allophones: [
		// optional: only include if there are any allophones. Below is an example, not really needed for this phoneme.
		{
			variant: "θ̠",
			description: "Retracted variant",
			context: "Before back vowels",
			examples: [
				{ word: "thought", transcription: "θɔt", audioUrl: "/audio/examples/thought.mp3" },
				{ word: "thaw", transcription: "θɔ", audioUrl: "/audio/examples/thaw.mp3" },
			],
		},
	],
};

type Props = React.ComponentProps<"div"> & {
	phonemeId: PhonemeSymbolId;
};

export function PhonemeDetails({ phonemeId, children, className, ...props }: Props) {
	return (
		<PhonemeDetailsProvider phonemeId={phonemeId}>
			<div className={cn("space-y-5 pb-5", className)} {...props} />
		</PhonemeDetailsProvider>
	);
}
