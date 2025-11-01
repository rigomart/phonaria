"use client";

import { PhonemeAllophones } from "./phoneme-allophones";
import { PhonemeArticulation } from "./phoneme-articulation";
import { PhonemeContrasts } from "./phoneme-contrasts";
import { PhonemeExamples } from "./phoneme-examples";
import { PhonemeHeader } from "./phoneme-header";

const MOCK_DATA = {
	symbol: "θ",
	description: "Voiceless dental fricative",
	audioUrl: "https://assets.rigos.dev/phoneme-examples/about.mp3",
	articulation: {
		illustration: {
			url: "https://assets.rigos.dev/diagrams/Voiceless_dental_fricative_articulation%201.svg",
			alt: "Voiceless dental fricative articulation",
		},
		features: {
			manner: "Fricative",
			place: "Dental",
			voicing: "Voiceless",
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
				grapheme: "think",
				phonemic: "θɪŋk",
				audioUrl: "https://assets.rigos.dev/phoneme-examples/ahead.mp3",
			},
			{
				grapheme: "month",
				phonemic: "mʌnθ",
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

export function PhonemeDetails() {
	return (
		<div className="space-y-5 pb-5">
			<PhonemeHeader
				symbol={MOCK_DATA.symbol}
				description={MOCK_DATA.description}
				audioUrl={MOCK_DATA.audioUrl}
			/>

			<PhonemeArticulation
				illustration={MOCK_DATA.articulation.illustration}
				features={MOCK_DATA.articulation.features}
				steps={MOCK_DATA.steps}
				pitfalls={MOCK_DATA.pitfalls}
			/>

			<PhonemeExamples examples={MOCK_DATA.examples} />

			<PhonemeContrasts contrasts={MOCK_DATA.contrasts} />

			<PhonemeAllophones allophones={MOCK_DATA.allophones} />
		</div>
	);
}
