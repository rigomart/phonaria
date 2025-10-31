"use client";

import { PhonemeAllophones } from "./phoneme-allophones";
import { PhonemeArticulation } from "./phoneme-articulation";
import { PhonemeContrasts } from "./phoneme-contrasts";
import { PhonemeExampleWords } from "./phoneme-example-words";
import { PhonemeHeader } from "./phoneme-header";
import { PhonemeSpellingPatterns } from "./phoneme-spelling-patterns";

const MOCK_DATA = {
	symbol: "θ",
	description: "Voiceless dental fricative",
	audioUrl: "https://assets.rigos.dev/phoneme-examples/about.mp3",
	articulation: {
		illustrationUrl: "https://assets.rigos.dev/diagrams/Voiced_alveolar_approximant.svg",
		features: {
			manner: "Fricative",
			place: "Dental",
			voicing: "Voiceless",
		},
	},
	steps: [
		"Place tongue tip between teeth",
		"Teeth should be slightly apart",
		"Blow air gently through the gap",
	],
	pitfalls: [
		{
			summary: "Substituting /s/ - tongue too far back",
			tip: "Keep your tongue tip between your front teeth, not against the alveolar ridge. The position matters more than the airflow.",
		},
		{
			summary: "Using /f/ - wrong articulator (lip vs tongue)",
			tip: "Remember: /θ/ uses your tongue against your teeth, while /f/ uses your lower lip against your upper teeth. Feel the difference.",
		},
	],
	spellingPatterns: [
		{
			pattern: "th",
			description: "Most common spelling",
			examples: ["think", "bath", "month", "breath"],
		},
	],
	examples: [
		{
			word: "think",
			transcription: "θɪŋk",
			audioUrl: "https://assets.rigos.dev/phoneme-examples/ahead.mp3",
		},
		{
			word: "month",
			transcription: "mʌnθ",
			audioUrl: "https://assets.rigos.dev/phoneme-examples/ahead.mp3",
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
	contrasts: [
		{
			partner: "ð",
			category: "Voicing",
			summary: "Voiceless /θ/ vs voiced /ð/—only the voicing changes",
			tactileCue: "Only /ð/ vibrates your throat. Touch your neck to feel the difference.",
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
		{
			partner: "t",
			category: "Manner",
			summary: "Distinguish fricative /θ/ from stop /t/—friction vs blockage",
			pairs: [
				{ word: "thick", transcription: "θɪk", audioUrl: "/audio/examples/thick.mp3" },
				{ word: "tick", transcription: "tɪk", audioUrl: "/audio/examples/tick.mp3" },
			],
		},
	],
};

export function PhonemeDetails() {
	return (
		<div className="space-y-4">
			<PhonemeHeader
				symbol={MOCK_DATA.symbol}
				description={MOCK_DATA.description}
				audioUrl={MOCK_DATA.audioUrl}
			/>

			<PhonemeArticulation
				illustrationUrl={MOCK_DATA.articulation.illustrationUrl}
				features={MOCK_DATA.articulation.features}
				steps={MOCK_DATA.steps}
				pitfalls={MOCK_DATA.pitfalls}
			/>

			<PhonemeSpellingPatterns patterns={MOCK_DATA.spellingPatterns} />

			<PhonemeExampleWords examples={MOCK_DATA.examples} />

			<PhonemeContrasts contrasts={MOCK_DATA.contrasts} />

			<PhonemeAllophones allophones={MOCK_DATA.allophones} />
		</div>
	);
}
