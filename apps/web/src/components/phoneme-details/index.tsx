"use client";

import { ArrowRight, ChevronDown, Info } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AudioControls } from "../audio-controls";
import { AspectRatio } from "../ui/aspect-ratio";

// Shared articulation definitions
const ARTICULATION_DEFINITIONS = {
	manner: {
		fricative: "Air flows with friction through a narrow gap. Sound is continuous.",
	},
	voicing: {
		voiceless: "Vocal cords don't vibrate. Touch your throat—you won't feel vibration.",
		voiced: "Vocal cords vibrate. Touch your throat—you'll feel vibration.",
	},
	place: {
		dental: "The tongue is placed between the teeth.",
	},
};

// PHASE 2: Mock data with audio URLs
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
		"Do not vibrate vocal cords",
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
		{
			summary: "Adding voice - should be voiceless",
			tip: "Place your hand on your throat. If you feel vibration, you're voicing. For /θ/, your throat should be silent.",
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
	sectionInfo: {
		voicingPair:
			"The voicing pair shows how adding vocal cord vibration changes the sound. /θ/ is voiceless (no vibration), while /ð/ is voiced (with vibration). This is a key distinction in English.",
		spellingPatterns:
			"Most English words use 'th' to represent this sound. Knowing these patterns helps you recognize and predict pronunciation when reading.",
		examples:
			"Hear how this sound appears in real words. Notice where it occurs (beginning, middle, or end) to understand its position in English.",
		contrasts:
			"Practice distinguishing this sound from similar-sounding phonemes. These minimal pairs help train your ear to hear the difference.",
		variations:
			"Some sounds have variations (allophones) depending on context or accent. These variants are pronounced slightly differently but represent the same phoneme.",
	},
};

export function PhonemeDetails() {
	const [expandedPitfalls, setExpandedPitfalls] = useState<number | null>(null);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2 font-bold">
						<span className="text-3xl text-muted-foreground/50">/</span>
						<span className="text-5xl leading-none tracking-tight">{MOCK_DATA.symbol}</span>
						<span className="text-3xl text-muted-foreground/50">/</span>
					</div>
					<AudioControls src={MOCK_DATA.audioUrl} label={`Play ${MOCK_DATA.symbol}`} />
				</div>
				<p className="text-sm text-muted-foreground">{MOCK_DATA.description}</p>
			</div>

			{/* Production Guide - Responsive */}
			<div className="pb-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="flex items-start justify-center">
					<AspectRatio ratio={1}>
						<Image
							src={MOCK_DATA.articulation.illustrationUrl}
							alt="Articulation Illustration"
							fill
							className="object-contain"
						/>
					</AspectRatio>
				</div>

				<div className="space-y-3">
					<section className="space-y-1.5">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Articulation
						</h4>
						<div className="flex flex-wrap gap-1">
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge variant="default" className="font-medium cursor-help text-xs px-2 py-0.5">
										Manner: {MOCK_DATA.articulation.features.manner}
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<div className="space-y-1">
										<p className="font-semibold text-xs">Manner</p>
										<p className="text-xs">{ARTICULATION_DEFINITIONS.manner.fricative}</p>
									</div>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge variant="default" className="cursor-help text-xs px-2 py-0.5">
										Place: {MOCK_DATA.articulation.features.place}
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<div className="space-y-1">
										<p className="font-semibold text-xs">Place</p>
										<p className="text-xs">{ARTICULATION_DEFINITIONS.place.dental}</p>
									</div>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge variant="default" className="cursor-help text-xs px-2 py-0.5">
										Voicing: {MOCK_DATA.articulation.features.voicing}
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<div className="space-y-1">
										<p className="font-semibold text-xs">Voicing</p>
										<p className="text-xs">{ARTICULATION_DEFINITIONS.voicing.voiceless}</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
					</section>

					<section className="space-y-1.5">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Step-by-Step
						</h4>
						<ol className="space-y-1 text-xs">
							{MOCK_DATA.steps.map((step, i) => (
								<li key={step} className="flex gap-1.5">
									<span className="text-primary font-semibold shrink-0">{i + 1}.</span>
									<span className="text-foreground">{step}</span>
								</li>
							))}
						</ol>
					</section>

					<section className="space-y-1.5">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
							Common Mistakes
						</h4>
						<div className="space-y-1">
							{MOCK_DATA.pitfalls.map((pitfall, idx) => (
								<Collapsible
									key={pitfall.summary}
									open={expandedPitfalls === idx}
									onOpenChange={(open) => setExpandedPitfalls(open ? idx : null)}
								>
									<CollapsibleTrigger asChild>
										<button
											type="button"
											className="w-full text-left flex items-start gap-1.5 px-1.5 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-xs"
										>
											<span className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">⚠</span>
											<span className="text-amber-900 dark:text-amber-200 flex-1">
												{pitfall.summary}
											</span>
											<ChevronDown
												className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 transition-transform"
												style={{
													transform: expandedPitfalls === idx ? "rotate(180deg)" : "rotate(0deg)",
												}}
											/>
										</button>
									</CollapsibleTrigger>
									<CollapsibleContent className="text-xs text-amber-800 dark:text-amber-100 pl-4 py-1 border-l border-amber-200 dark:border-amber-800 ml-1">
										<p>{pitfall.tip}</p>
									</CollapsibleContent>
								</Collapsible>
							))}
						</div>
					</section>
				</div>
			</div>

			{/* Spelling Patterns */}
			<section className="space-y-2">
				<div className="flex items-center gap-1.5">
					<h3 className="text-xs font-semibold">Spelling Patterns</h3>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								aria-label="Learn more about spelling patterns"
							>
								<Info className="h-4 w-4" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-64 text-sm">
							<p>{MOCK_DATA.sectionInfo.spellingPatterns}</p>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-2">
					{MOCK_DATA.spellingPatterns.map((pattern) => (
						<div key={pattern.pattern} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
							<div className="flex items-center gap-1.5">
								<span className="inline-flex items-center justify-center rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
									{pattern.pattern}
								</span>
								<span className="text-xs text-muted-foreground">{pattern.description}</span>
							</div>
							<div className="flex flex-wrap gap-1.5">
								{pattern.examples.map((example) => (
									<span
										key={example}
										className="inline-flex items-center rounded-md border bg-background px-2 py-0.5 text-xs font-medium"
									>
										{example}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Examples */}
			<section className="space-y-2">
				<div className="flex items-center gap-1.5">
					<h3 className="text-xs font-semibold">Examples</h3>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								aria-label="Learn more about examples"
							>
								<Info className="h-4 w-4" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-64 text-sm">
							<p>{MOCK_DATA.sectionInfo.examples}</p>
						</PopoverContent>
					</Popover>
				</div>
				<div className="grid gap-1.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{MOCK_DATA.examples.map((example) => (
						<div
							key={example.word}
							className="flex items-center justify-between gap-2 rounded-md border bg-card p-2"
						>
							<div className="min-w-0 flex-1">
								<div className="font-medium text-xs truncate">{example.word}</div>
								<div className="text-[11px] text-muted-foreground">/{example.transcription}/</div>
							</div>
							<AudioControls src={example.audioUrl} label={example.word} />
						</div>
					))}
				</div>
			</section>

			{/* Practice Contrasts */}
			<section className="space-y-2">
				<div className="flex items-center gap-1.5">
					<h3 className="text-xs font-semibold">Practice Contrasts</h3>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								aria-label="Learn more about practice contrasts"
							>
								<Info className="h-4 w-4" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-64 text-sm">
							<p>{MOCK_DATA.sectionInfo.contrasts}</p>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-3">
					{MOCK_DATA.contrasts.map((contrast, idx) => (
						<div
							key={contrast.partner}
							className={`rounded-lg border p-4 space-y-3 ${idx === 0 ? "border-solid border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20" : "border-dashed border-muted-foreground/30 bg-muted/10"}`}
						>
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm font-semibold">/θ/ vs /{contrast.partner}/</div>
								<Badge
									variant={idx === 0 ? "default" : "outline"}
									className="text-[10px] uppercase tracking-wide"
								>
									{contrast.category}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">{contrast.summary}</p>
							{contrast.tactileCue && (
								<div className="rounded-md bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-2.5 text-xs text-blue-900 dark:text-blue-100">
									<span className="font-semibold">Quick tip: </span>
									{contrast.tactileCue}
								</div>
							)}
							<div className="grid grid-cols-2 gap-3">
								{contrast.pairs.map((pair) => (
									<div key={pair.word} className="rounded-md border bg-background p-3 space-y-2">
										<div>
											<div className="text-xs font-semibold">{pair.word}</div>
											<div className="text-[10px] text-muted-foreground">
												/{pair.transcription}/
											</div>
										</div>
										<AudioControls src={pair.audioUrl} label={pair.word} />
									</div>
								))}
							</div>
							<button
								type="button"
								className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
							>
								Start practice session
								<ArrowRight className="h-3 w-3" />
							</button>
						</div>
					))}
				</div>
			</section>

			{/* Allophones */}
			<section className="space-y-2">
				<div className="flex items-center gap-1.5">
					<h3 className="text-xs font-semibold">Variations</h3>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								aria-label="Learn more about variations"
							>
								<Info className="h-4 w-4" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-64 text-sm">
							<p>{MOCK_DATA.sectionInfo.variations}</p>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-4">
					{MOCK_DATA.allophones.map((allo) => (
						<div key={allo.variant} className="space-y-2">
							<div className="flex items-baseline gap-2">
								<span className="font-medium text-sm">{allo.variant}</span>
								<span className="text-xs text-muted-foreground">{allo.description}</span>
							</div>
							<p className="text-xs text-muted-foreground">Context: {allo.context}</p>
							<div className="space-y-1.5">
								{allo.examples.map((ex) => (
									<div
										key={ex.word}
										className="flex items-center justify-between gap-2 rounded border bg-card p-2"
									>
										<div>
											<div className="text-xs font-medium">{ex.word}</div>
											<div className="text-[10px] text-muted-foreground">/{ex.transcription}/</div>
										</div>
										<AudioControls src={ex.audioUrl} label={ex.word} />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
