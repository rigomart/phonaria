"use client";

import { ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
			words: ["think", "sink"],
		},
		{
			partner: "t",
			category: "Manner",
			summary: "Distinguish fricative /θ/ from stop /t/",
			words: ["thick", "tick"],
		},
	],
};

export function PhonemeDetails() {
	const [showAllExamples, setShowAllExamples] = useState(false);
	const displayedExamples = showAllExamples ? MOCK_DATA.examples : MOCK_DATA.examples.slice(0, 4);

	return (
		<div className="space-y-4">
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

			{/* Tabs */}
			<Tabs defaultValue="how-to" className="w-full">
				<TabsList className="w-full grid grid-cols-3">
					<TabsTrigger value="how-to">How to</TabsTrigger>
					<TabsTrigger value="allophones">Allophones</TabsTrigger>
					<TabsTrigger value="practice">Practice</TabsTrigger>
				</TabsList>

				{/* How to Tab */}
				<TabsContent value="how-to" className="mt-3">
					<div className="pb-2 grid grid-cols-2 gap-6">
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
				</TabsContent>

				{/* Allophones Tab */}
				<TabsContent value="allophones" className="mt-3">
					<div className="space-y-4 pb-2">
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
												<div className="text-[10px] text-muted-foreground">
													/{ex.transcription}/
												</div>
											</div>
											<AudioControls src={ex.audioUrl} label={ex.word} />
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</TabsContent>

				{/* Practice Tab */}
				<TabsContent value="practice" className="mt-3">
					<div className="space-y-3 pb-2">
						<p className="text-xs text-muted-foreground">
							Practice distinguishing <span className="font-semibold text-foreground">/θ/</span>{" "}
							from similar sounds.
						</p>
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
									<div className="rounded-md border bg-background px-3 py-2 text-xs font-medium">
										{contrast.words[0]} · {contrast.words[1]}
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
					</div>
				</TabsContent>
			</Tabs>

			{/* Examples */}
			<section className="space-y-3">
				<h3 className="text-sm font-semibold">Examples</h3>
				<div className="grid gap-2 grid-cols-2">
					{displayedExamples.map((example) => (
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
				{MOCK_DATA.examples.length > 4 && !showAllExamples && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowAllExamples(true)}
						className="w-full text-xs"
					>
						Show {MOCK_DATA.examples.length - 4} more examples
					</Button>
				)}
			</section>
		</div>
	);
}
