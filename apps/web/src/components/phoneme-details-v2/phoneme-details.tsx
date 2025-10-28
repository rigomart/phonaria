"use client";

import { ArrowRight, Info } from "lucide-react";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";

// PHASE 2: Mock data with audio URLs
const MOCK_DATA = {
	symbol: "θ",
	description: "voiceless dental fricative",
	audioUrl: "/audio/examples/think.mp3",
	articulation: {
		primary: "Dental Fricative",
		voicing: "Voiceless",
		airflow: "Continuous",
		difficulty: "Hard for Spanish/French speakers",
	},
	steps: [
		"Place tongue tip between teeth",
		"Teeth should be slightly apart",
		"Blow air gently through the gap",
		"Do not vibrate vocal cords",
	],
	pitfalls: [
		"Substituting /s/ - tongue too far back",
		"Using /f/ - wrong articulator (lip vs tongue)",
		"Adding voice - should be voiceless",
	],
	voicingPair: {
		symbol: "ð",
		description: "voiced dental fricative",
		audioUrl: "/audio/examples/this.mp3",
		example: "this",
		transcription: "ðɪs",
	},
	spellingPatterns: [
		{
			pattern: "th",
			description: "Most common spelling",
			examples: ["think", "bath", "month", "breath"],
		},
	],
	examples: [
		{ word: "think", transcription: "θɪŋk", audioUrl: "/audio/examples/think.mp3" },
		{ word: "month", transcription: "mʌnθ", audioUrl: "/audio/examples/month.mp3" },
		{ word: "bath", transcription: "bæθ", audioUrl: "/audio/examples/bath.mp3" },
		{ word: "truth", transcription: "truθ", audioUrl: "/audio/examples/truth.mp3" },
		{ word: "breath", transcription: "brɛθ", audioUrl: "/audio/examples/breath.mp3" },
		{ word: "worth", transcription: "wɜrθ", audioUrl: "/audio/examples/worth.mp3" },
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
			partner: "s",
			category: "Fricative",
			summary: "Contrast dental /θ/ with alveolar /s/",
			pairs: [
				{ word: "think", transcription: "θɪŋk", audioUrl: "/audio/examples/think.mp3" },
				{ word: "sink", transcription: "sɪŋk", audioUrl: "/audio/examples/sink.mp3" },
			],
		},
		{
			partner: "t",
			category: "Manner",
			summary: "Distinguish fricative /θ/ from stop /t/",
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
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 space-y-2">
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1 font-bold">
							<span className="text-3xl text-muted-foreground/50">/</span>
							<span className="text-5xl leading-none tracking-tight">{MOCK_DATA.symbol}</span>
							<span className="text-3xl text-muted-foreground/50">/</span>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									href="/credits"
									className="text-muted-foreground hover:text-foreground transition-colors"
									aria-label="Audio credits"
								>
									<Info className="h-4 w-4" />
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">Audio credits</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<p className="text-sm text-muted-foreground">{MOCK_DATA.description}</p>
				</div>
				<div className="shrink-0">
					<AudioControls
						src={MOCK_DATA.audioUrl}
						label={`Phoneme ${MOCK_DATA.symbol}`}
						variant="extended"
					/>
				</div>
			</div>

			{/* Production Guide - Responsive */}
			<div className="pb-2 grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="flex items-start justify-center">
					<div
						className="rounded-lg border bg-muted/30 text-muted-foreground flex items-center justify-center select-none shrink-0"
						style={{ width: "220px", height: "220px" }}
					>
						<span className="text-xs text-center px-4">Sagittal diagram</span>
					</div>
				</div>

				<div className="space-y-4">
					<section className="space-y-2">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Articulation
						</h4>
						<div className="flex flex-wrap gap-1.5">
							<Badge variant="default" className="font-medium">
								{MOCK_DATA.articulation.primary}
							</Badge>
							<Badge variant="secondary">{MOCK_DATA.articulation.voicing}</Badge>
							<Badge variant="secondary">{MOCK_DATA.articulation.airflow}</Badge>
							<Badge variant="outline" className="text-xs">
								{MOCK_DATA.articulation.difficulty}
							</Badge>
						</div>
					</section>

					<section className="space-y-2">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Step-by-Step
						</h4>
						<ol className="space-y-1.5 text-sm">
							{MOCK_DATA.steps.map((step, i) => (
								<li key={step} className="flex gap-2">
									<span className="text-primary font-semibold shrink-0">{i + 1}.</span>
									<span className="text-foreground">{step}</span>
								</li>
							))}
						</ol>
					</section>

					<section className="space-y-2">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
							Common Mistakes
						</h4>
						<ul className="space-y-1 text-xs">
							{MOCK_DATA.pitfalls.map((pitfall) => (
								<li key={pitfall} className="flex gap-1.5 items-start">
									<span className="text-amber-600 dark:text-amber-500 shrink-0">⚠</span>
									<span className="text-amber-900 dark:text-amber-200">{pitfall}</span>
								</li>
							))}
						</ul>
					</section>
				</div>
			</div>

			{/* Voicing Pair */}
			<section className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold">Voicing Pair</h3>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								aria-label="Learn more about voicing pairs"
							>
								<Info className="h-4 w-4" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-64 text-sm">
							<p>{MOCK_DATA.sectionInfo.voicingPair}</p>
						</PopoverContent>
					</Popover>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg border bg-card p-4 space-y-2">
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-bold text-primary">/θ/</span>
							<span className="text-xs text-muted-foreground">Voiceless</span>
						</div>
						<p className="text-xs text-muted-foreground">{MOCK_DATA.description}</p>
						<div className="pt-2">
							<AudioControls src={MOCK_DATA.audioUrl} label="θ" />
						</div>
					</div>
					<div className="rounded-lg border bg-card p-4 space-y-2">
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-bold text-primary">/ð/</span>
							<span className="text-xs text-muted-foreground">Voiced</span>
						</div>
						<p className="text-xs text-muted-foreground">{MOCK_DATA.voicingPair.description}</p>
						<div className="pt-2">
							<AudioControls src={MOCK_DATA.voicingPair.audioUrl} label="ð" />
						</div>
					</div>
				</div>
			</section>

			{/* Spelling Patterns */}
			<section className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold">Spelling Patterns</h3>
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
				<div className="space-y-3">
					{MOCK_DATA.spellingPatterns.map((pattern) => (
						<div key={pattern.pattern} className="rounded-lg border bg-muted/30 p-4 space-y-2">
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center justify-center rounded-md bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground">
									{pattern.pattern}
								</span>
								<span className="text-xs text-muted-foreground">{pattern.description}</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{pattern.examples.map((example) => (
									<span
										key={example}
										className="inline-flex items-center rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium"
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
			<section className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold">Examples</h3>
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
				<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{MOCK_DATA.examples.map((example) => (
						<div
							key={example.word}
							className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
						>
							<div className="min-w-0 flex-1">
								<div className="font-medium text-sm truncate">{example.word}</div>
								<div className="text-xs text-muted-foreground">/{example.transcription}/</div>
							</div>
							<AudioControls src={example.audioUrl} label={example.word} />
						</div>
					))}
				</div>
			</section>

			{/* Practice Contrasts */}
			<section className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold">Practice Contrasts</h3>
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
					{MOCK_DATA.contrasts.map((contrast) => (
						<div
							key={contrast.partner}
							className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4 space-y-3"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm font-semibold">/θ/ vs /{contrast.partner}/</div>
								<Badge variant="outline" className="text-[10px] uppercase tracking-wide">
									{contrast.category}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">{contrast.summary}</p>
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
			<section className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold">Variations</h3>
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
