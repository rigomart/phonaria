"use client";

import { Lightbulb, Link as LinkIcon, LucideEar, Play, Volume2, Waves } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PlaybackClip = {
	id: string;
	word: string;
	context: string;
	ipa: string;
	src: string;
	note?: string;
};

type ProductionStep = {
	id: string;
	title: string;
	description: string;
};

type StaticVisual = {
	id: string;
	src: string;
	alt: string;
	caption: string;
};

type Callout = {
	label: string;
	description: string;
};

type GraphemePattern = {
	id: string;
	pattern: string;
	frequency: "common" | "occasional" | "rare";
	example?: string;
	isExtended?: boolean;
};

type VariationItem = {
	id: string;
	label: string;
	description: string;
	hasAudio?: boolean;
};

type ExampleItem = {
	id: string;
	context: "initial" | "medial" | "final" | "cluster";
	word: string;
	ipa: string;
	stress: "primary" | "secondary" | "none";
	src: string;
	note?: string;
};

type ContrastItem = {
	id: string;
	label: string;
	cue: string;
	samplePair?: string;
};

type ContrastLink = {
	label: string;
	href: string;
};

type PracticeTip = {
	id: string;
	title: string;
	summary: string;
	detail: string;
	audioSrc?: string;
	selfCheck?: string;
};

export type PhonemeDetailsPlanContent = {
	identity: {
		symbol: string;
		name: string;
		category: string;
		description: string;
		mnemonic: string;
	};
	playback: {
		mainSrc: string;
		loopLabel: string;
		wordClips: PlaybackClip[];
		statusMessage?: string;
	};
	production: {
		intro: string;
		steps: ProductionStep[];
		visuals: StaticVisual[];
		commonMistake?: Callout;
		sensoryCue?: Callout;
	};
	spelling: {
		intro: string;
		patterns: GraphemePattern[];
		exception?: Callout;
	};
	variations: {
		intro: string;
		items: VariationItem[];
	};
	examples: {
		intro: string;
		items: ExampleItem[];
		sourceHighlight?: { label: string; word: string };
	};
	contrasts: {
		intro: string;
		items: ContrastItem[];
		link: ContrastLink;
	};
	tips: {
		intro: string;
		items: PracticeTip[];
	};
};

const stressLabel: Record<ExampleItem["stress"], string> = {
	none: "No primary stress",
	primary: "Primary stress",
	secondary: "Secondary stress",
};

const frequencyLabel: Record<GraphemePattern["frequency"], string> = {
	common: "Common",
	occasional: "Occasional",
	rare: "Rare",
};

export function PhonemeDetailsPlan({ content }: { content: PhonemeDetailsPlanContent }) {
	const [loopEnabled, setLoopEnabled] = useState(false);
	const [extendedPatternsOpen, setExtendedPatternsOpen] = useState(false);
	const [showAllVariations, setShowAllVariations] = useState(false);
	const [activeTipId, setActiveTipId] = useState<string | null>(null);

	const primaryPatterns = useMemo(
		() => content.spelling.patterns.filter((pattern) => !pattern.isExtended),
		[content.spelling.patterns],
	);

	const extendedPatterns = useMemo(
		() => content.spelling.patterns.filter((pattern) => pattern.isExtended),
		[content.spelling.patterns],
	);

	const groupedExamples = useMemo(() => {
		return content.examples.items.reduce<Record<string, ExampleItem[]>>((acc, item) => {
			if (!acc[item.context]) {
				acc[item.context] = [];
			}
			acc[item.context]?.push(item);
			return acc;
		}, {});
	}, [content.examples.items]);

	const variationItems = showAllVariations
		? content.variations.items
		: content.variations.items.slice(0, 2);

	return (
		<article
			aria-label={`Details for phoneme ${content.identity.symbol}`}
			className="bg-background/90 text-foreground mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-2xl border border-border/60 p-10 shadow-sm"
		>
			<IdentitySnapshot content={content.identity} />
			<Separator className="bg-border/60" />
			<SoundPlaybackSection
				content={content.playback}
				loopEnabled={loopEnabled}
				onToggleLoop={() => setLoopEnabled((prev) => !prev)}
			/>
			<Separator className="bg-border/60" />
			<ProductionGuidanceSection content={content.production} />
			<Separator className="bg-border/60" />
			<SpellingBridgesSection
				content={content.spelling}
				primaryPatterns={primaryPatterns}
				extendedPatterns={extendedPatterns}
				open={extendedPatternsOpen}
				onToggle={setExtendedPatternsOpen}
			/>
			<Separator className="bg-border/60" />
			<VariationContextSection
				content={content.variations}
				items={variationItems}
				totalVariations={content.variations.items.length}
				showAll={showAllVariations}
				onShowAll={setShowAllVariations}
			/>
			<Separator className="bg-border/60" />
			<ExampleLibrarySection content={content.examples} groupedExamples={groupedExamples} />
			<Separator className="bg-border/60" />
			<ContrastPreviewSection content={content.contrasts} />
			<Separator className="bg-border/60" />
			<TipsPracticeSection
				content={content.tips}
				activeTipId={activeTipId}
				onToggleTip={setActiveTipId}
			/>
		</article>
	);
}

function IdentitySnapshot({ content }: { content: PhonemeDetailsPlanContent["identity"] }) {
	return (
		<section className="flex flex-col gap-4" aria-labelledby="phoneme-identity-heading">
			<div>
				<h2 id="phoneme-identity-heading" className="text-base font-semibold tracking-tight">
					Identity snapshot
				</h2>
				<p className="text-sm text-muted-foreground">{content.mnemonic}</p>
			</div>
			<div className="flex flex-wrap items-center gap-6">
				<div className="flex items-baseline gap-2">
					<span className="text-muted-foreground/50 text-4xl leading-none">/</span>
					<span className="text-5xl font-semibold tracking-tight">{content.symbol}</span>
					<span className="text-muted-foreground/50 text-4xl leading-none">/</span>
				</div>
				<div className="flex flex-col gap-1">
					<Badge variant="outline" className="uppercase tracking-wide text-[11px]">
						{content.category}
					</Badge>
					<span className="text-sm font-medium text-muted-foreground">{content.name}</span>
				</div>
			</div>
			<p className="text-sm leading-relaxed text-muted-foreground">{content.description}</p>
		</section>
	);
}

function SoundPlaybackSection({
	content,
	loopEnabled,
	onToggleLoop,
}: {
	content: PhonemeDetailsPlanContent["playback"];
	loopEnabled: boolean;
	onToggleLoop: () => void;
}) {
	const [ariaStatus, setAriaStatus] = useState(content.statusMessage ?? "");
	const [activeClipId, setActiveClipId] = useState(content.wordClips[0]?.id ?? "");

	useEffect(() => {
		if (!content.wordClips.length) {
			setActiveClipId("");
			return;
		}
		if (!content.wordClips.some((clip) => clip.id === activeClipId)) {
			setActiveClipId(content.wordClips[0]?.id ?? "");
		}
	}, [activeClipId, content.wordClips]);

	return (
		<section aria-labelledby="sound-playback-heading" className="flex flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 id="sound-playback-heading" className="text-base font-semibold">
						Sound playback modes
					</h2>
					<p className="text-sm text-muted-foreground">
						Compare normal and slowed articulations, or loop the sound while you shadow it.
					</p>
				</div>
				<ButtonGroup aria-label="Primary playback controls">
					<AudioControls src={content.mainSrc} label="phoneme clip" variant="extended" />
					<ButtonGroupSeparator />
					<Button
						type="button"
						variant={loopEnabled ? "default" : "outline"}
						size="sm"
						aria-pressed={loopEnabled}
						onClick={() => {
							onToggleLoop();
							setAriaStatus(`Loop ${loopEnabled ? "off" : "on"}.`);
						}}
						className="gap-1 px-3 text-xs"
					>
						<Waves className="h-3 w-3" />
						<span>{content.loopLabel}</span>
					</Button>
				</ButtonGroup>
			</div>
			<DividerLabel>Word clips</DividerLabel>
			{content.wordClips.length ? (
				<Tabs
					value={activeClipId}
					onValueChange={setActiveClipId}
					className="flex flex-col gap-3"
					aria-label="Word clip list"
				>
					<div className="rounded-lg border border-border/50 bg-muted/20 px-2 py-1">
						<TabsList className="flex w-max flex-wrap gap-2 bg-transparent p-1">
							{content.wordClips.map((clip) => (
								<TabsTrigger
									key={clip.id}
									value={clip.id}
									className="data-[state=active]:bg-background data-[state=active]:text-foreground flex h-auto items-center gap-2 rounded-md px-3 py-2 text-xs font-medium capitalize"
								>
									<span className="font-semibold">{clip.word}</span>
									<span className="text-muted-foreground">· {clip.context}</span>
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					{content.wordClips.map((clip) => (
						<TabsContent key={clip.id} value={clip.id} className="outline-none">
							<div className="border-border/60 bg-background/90 flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-foreground">{clip.word}</p>
										<p className="text-xs text-muted-foreground">
											<span className="font-mono">{clip.ipa}</span>
											{" · "}
											{clip.context}
										</p>
									</div>
									<AudioControls src={clip.src} label={`${clip.word} clip`} />
								</div>
								{clip.note ? (
									<p className="text-xs text-muted-foreground leading-relaxed">{clip.note}</p>
								) : null}
							</div>
						</TabsContent>
					))}
				</Tabs>
			) : (
				<p className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-xs text-muted-foreground">
					Upcoming iterations will add contextual clips once the audio library is refreshed.
				</p>
			)}
			<span className="sr-only" aria-live="polite">
				{ariaStatus}
			</span>
		</section>
	);
}

function ProductionGuidanceSection({
	content,
}: {
	content: PhonemeDetailsPlanContent["production"];
}) {
	const [activeStepId, setActiveStepId] = useState(content.steps[0]?.id ?? "");

	useEffect(() => {
		if (!content.steps.length) {
			setActiveStepId("");
			return;
		}
		if (!content.steps.some((step) => step.id === activeStepId)) {
			setActiveStepId(content.steps[0]?.id ?? "");
		}
	}, [activeStepId, content.steps]);

	const activeStepIndex = content.steps.findIndex((step) => step.id === activeStepId);
	const activeVisual =
		activeStepIndex >= 0 && content.visuals[activeStepIndex]
			? content.visuals[activeStepIndex]
			: (content.visuals[0] ?? null);

	return (
		<section aria-labelledby="production-guidance-heading" className="flex flex-col gap-6">
			<div>
				<h2 id="production-guidance-heading" className="text-base font-semibold">
					Production guidance
				</h2>
				<p className="text-sm text-muted-foreground">{content.intro}</p>
			</div>
			{content.steps.length ? (
				<Tabs
					value={activeStepId}
					onValueChange={setActiveStepId}
					className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
				>
					<div className="flex flex-col gap-4">
						<TabsList className="bg-transparent p-0">
							<div className="flex flex-wrap gap-2">
								{content.steps.map((step, index) => (
									<TabsTrigger
										key={step.id}
										value={step.id}
										className="data-[state=active]:bg-background data-[state=active]:text-foreground flex h-auto min-w-[7rem] flex-col items-start gap-1 rounded-md border border-border/40 px-3 py-2 text-left text-xs uppercase tracking-wide"
									>
										<span className="font-semibold">Step {index + 1}</span>
										<span className="text-muted-foreground text-[11px]">{step.title}</span>
									</TabsTrigger>
								))}
							</div>
						</TabsList>
						{content.steps.map((step) => (
							<TabsContent
								key={step.id}
								value={step.id}
								className="border-border/60 bg-background/90 rounded-xl border p-4 shadow-xs outline-none"
							>
								<h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
							</TabsContent>
						))}
					</div>
					<div className="flex flex-col gap-4">
						{activeVisual ? (
							<figure className="bg-muted/30 border-border/60 flex flex-col gap-2 rounded-xl border p-4">
								<div
									className="bg-muted/70 flex aspect-video w-full items-center justify-center rounded-lg text-xs text-muted-foreground"
									role="img"
									aria-label={activeVisual.alt}
								>
									Static diagram placeholder
								</div>
								<figcaption className="text-xs text-muted-foreground">
									{activeVisual.caption}
								</figcaption>
							</figure>
						) : null}
						<div className="flex flex-wrap gap-2">
							{content.commonMistake ? (
								<GuidancePopoverButton
									icon={<Volume2 className="h-4 w-4" />}
									label={content.commonMistake.label}
									description={content.commonMistake.description}
								/>
							) : null}
							{content.sensoryCue ? (
								<GuidancePopoverButton
									icon={<LucideEar className="h-4 w-4" />}
									label={content.sensoryCue.label}
									description={content.sensoryCue.description}
								/>
							) : null}
						</div>
					</div>
				</Tabs>
			) : null}
		</section>
	);
}

function AlertIcon() {
	return <Volume2 className="h-4 w-4" />;
}

function CalloutCard({
	icon,
	callout,
	variant = "default",
}: {
	icon: ReactNode;
	callout: Callout;
	variant?: "default" | "warning";
}) {
	return (
		<Card
			role="note"
			className={cn(
				"shadow-none",
				variant === "warning"
					? "bg-amber-50 border-amber-400/60 text-amber-900"
					: "bg-slate-50 border-slate-200 text-slate-900 dark:bg-muted/40 dark:border-border",
			)}
		>
			<CardHeader className="flex flex-row items-start gap-3">
				<span className="mt-1 rounded-md bg-background/80 p-1 text-muted-foreground">{icon}</span>
				<div>
					<CardTitle className="text-sm font-semibold">{callout.label}</CardTitle>
					<CardDescription className="text-xs text-inherit opacity-80">
						{callout.description}
					</CardDescription>
				</div>
			</CardHeader>
		</Card>
	);
}

function GuidancePopoverButton({
	icon,
	label,
	description,
}: {
	icon: ReactNode;
	label: string;
	description: string;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 text-xs">
					<span className="text-muted-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0">
						{icon}
					</span>
					<span className="font-medium text-foreground">{label}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 text-sm leading-relaxed">
				<p className="font-semibold text-foreground">{label}</p>
				<p className="mt-1 text-muted-foreground">{description}</p>
			</PopoverContent>
		</Popover>
	);
}

function SpellingBridgesSection({
	content,
	primaryPatterns,
	extendedPatterns,
	open,
	onToggle,
}: {
	content: PhonemeDetailsPlanContent["spelling"];
	primaryPatterns: GraphemePattern[];
	extendedPatterns: GraphemePattern[];
	open: boolean;
	onToggle: (open: boolean) => void;
}) {
	return (
		<section aria-labelledby="spelling-bridges-heading" className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 id="spelling-bridges-heading" className="text-base font-semibold">
						Spelling bridges
					</h2>
					<p className="text-sm text-muted-foreground">{content.intro}</p>
				</div>
				{extendedPatterns.length ? (
					<Collapsible open={open} onOpenChange={onToggle}>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" size="sm" className="gap-1 text-xs" aria-expanded={open}>
								<Lightbulb className="h-4 w-4" />
								{open ? "Hide extended patterns" : "Show extended patterns"}
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-3 space-y-2">
							<GraphemePatternList patterns={extendedPatterns} />
						</CollapsibleContent>
					</Collapsible>
				) : null}
			</div>
			<GraphemePatternList patterns={primaryPatterns} />
			{content.exception ? (
				<CalloutCard icon={<AlertIcon />} callout={content.exception} variant="warning" />
			) : null}
		</section>
	);
}

function GraphemePatternList({ patterns }: { patterns: GraphemePattern[] }) {
	return (
		<ul className="grid gap-3 sm:grid-cols-2">
			{patterns.map((pattern) => (
				<li key={pattern.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
					<div className="flex items-center justify-between gap-2">
						<span className="font-semibold text-sm">{pattern.pattern}</span>
						<Badge variant="outline" className="text-[10px] uppercase">
							{frequencyLabel[pattern.frequency]}
						</Badge>
					</div>
					{pattern.example ? (
						<p className="mt-2 text-xs text-muted-foreground">{pattern.example}</p>
					) : null}
				</li>
			))}
		</ul>
	);
}

function VariationContextSection({
	content,
	items,
	totalVariations,
	showAll,
	onShowAll,
}: {
	content: PhonemeDetailsPlanContent["variations"];
	items: VariationItem[];
	totalVariations: number;
	showAll: boolean;
	onShowAll: (value: boolean) => void;
}) {
	const remaining = totalVariations - items.length;
	const [activeVariationId, setActiveVariationId] = useState(items[0]?.id ?? "");

	useEffect(() => {
		if (!items.length) {
			setActiveVariationId("");
			return;
		}
		if (!items.some((variation) => variation.id === activeVariationId)) {
			setActiveVariationId(items[0]?.id ?? "");
		}
	}, [activeVariationId, items]);

	return (
		<section aria-labelledby="variation-context-heading" className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 id="variation-context-heading" className="text-base font-semibold">
						Variation context
					</h2>
					<p className="text-sm text-muted-foreground">{content.intro}</p>
				</div>
				{remaining > 0 ? (
					<Button
						type="button"
						size="sm"
						variant="ghost"
						className="text-xs"
						onClick={() => onShowAll(true)}
					>
						Show {remaining} more
					</Button>
				) : null}
			</div>
			{items.length ? (
				<Tabs
					value={activeVariationId}
					onValueChange={setActiveVariationId}
					className="flex flex-col gap-3"
				>
					<div className="rounded-lg border border-border/40 bg-muted/20 px-2 py-2">
						<TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
							{items.map((variation) => (
								<TabsTrigger
									key={variation.id}
									value={variation.id}
									className="data-[state=active]:bg-background data-[state=active]:text-foreground flex h-auto items-center gap-2 rounded-md border border-transparent px-3 py-2 text-xs font-semibold"
								>
									<span>{variation.label}</span>
									{variation.hasAudio ? (
										<span className="text-[10px] uppercase text-primary">Audio</span>
									) : null}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					{items.map((variation) => (
						<TabsContent
							key={variation.id}
							value={variation.id}
							className="border-border/60 bg-background/90 rounded-xl border p-4 shadow-xs outline-none"
						>
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-semibold text-foreground">{variation.label}</h3>
								{variation.hasAudio ? (
									<Badge variant="secondary" className="text-[10px] uppercase">
										Audio cue available
									</Badge>
								) : null}
							</div>
							<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
								{variation.description}
							</p>
						</TabsContent>
					))}
				</Tabs>
			) : (
				<p className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-xs text-muted-foreground">
					Variations will populate once contextual audio is confirmed.
				</p>
			)}
			{!showAll && remaining > 0 ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="self-start text-xs"
					onClick={() => onShowAll(true)}
					aria-label={`Show ${remaining} additional variations`}
				>
					Load additional variations
				</Button>
			) : null}
		</section>
	);
}

function ExampleLibrarySection({
	content,
	groupedExamples,
}: {
	content: PhonemeDetailsPlanContent["examples"];
	groupedExamples: Record<string, ExampleItem[]>;
}) {
	const exampleEntries = useMemo(() => {
		const order = ["initial", "medial", "final", "cluster"];
		return Object.entries(groupedExamples).sort((a, b) => {
			const aIndex = order.indexOf(a[0]);
			const bIndex = order.indexOf(b[0]);
			return (aIndex === -1 ? order.length : aIndex) - (bIndex === -1 ? order.length : bIndex);
		});
	}, [groupedExamples]);

	const [activeContext, setActiveContext] = useState(exampleEntries[0]?.[0] ?? "");

	useEffect(() => {
		if (!exampleEntries.length) {
			setActiveContext("");
			return;
		}
		if (!exampleEntries.some(([context]) => context === activeContext)) {
			setActiveContext(exampleEntries[0]?.[0] ?? "");
		}
	}, [activeContext, exampleEntries]);

	return (
		<section aria-labelledby="example-library-heading" className="flex flex-col gap-4">
			<div>
				<h2 id="example-library-heading" className="text-base font-semibold">
					Example library
				</h2>
				<p className="text-sm text-muted-foreground">{content.intro}</p>
			</div>
			{exampleEntries.length ? (
				<Tabs
					value={activeContext}
					onValueChange={setActiveContext}
					className="flex flex-col gap-4"
					aria-label="Example positions"
				>
					<TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
						{exampleEntries.map(([context, examples]) => (
							<TabsTrigger
								key={context}
								value={context}
								className="data-[state=active]:bg-background data-[state=active]:text-foreground flex h-auto items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
							>
								<span>{context}</span>
								<Badge variant="outline" className="text-[10px]">
									{examples.length}
								</Badge>
							</TabsTrigger>
						))}
					</TabsList>
					{exampleEntries.map(([context, examples]) => (
						<TabsContent
							key={context}
							value={context}
							className="border-border/60 bg-background/90 rounded-xl border p-4 shadow-xs outline-none"
						>
							<ul className="space-y-3">
								{examples.map((example) => (
									<li
										key={example.id}
										className="flex flex-col gap-2 rounded-lg border border-border/70 p-3"
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-semibold text-foreground">{example.word}</p>
												<p className="text-xs text-muted-foreground">
													<span className="font-mono">{example.ipa}</span>
													{" · "}
													{stressLabel[example.stress]}
												</p>
											</div>
											<AudioControls src={example.src} label={`${example.word} example`} />
										</div>
										{example.note ? (
											<p className="text-xs text-muted-foreground">{example.note}</p>
										) : null}
									</li>
								))}
							</ul>
						</TabsContent>
					))}
				</Tabs>
			) : (
				<p className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-xs text-muted-foreground">
					Example words will appear here once sample data is available.
				</p>
			)}
			{content.sourceHighlight ? (
				<div className="border-primary/40 bg-primary/5 text-primary flex items-center gap-2 rounded-xl border p-3 text-sm font-medium">
					<LinkIcon className="h-4 w-4" />
					<span>
						{content.sourceHighlight.label}:{" "}
						<span className="font-semibold text-primary">{content.sourceHighlight.word}</span>
					</span>
				</div>
			) : null}
		</section>
	);
}

function ContrastPreviewSection({ content }: { content: PhonemeDetailsPlanContent["contrasts"] }) {
	return (
		<section aria-labelledby="contrast-preview-heading" className="flex flex-col gap-4">
			<div>
				<h2 id="contrast-preview-heading" className="text-base font-semibold">
					Contrast preview
				</h2>
				<p className="text-sm text-muted-foreground">{content.intro}</p>
			</div>
			<ul className="grid gap-3">
				{content.items.map((item) => (
					<li
						key={item.id}
						className="border-border/60 bg-muted/20 rounded-xl border p-4 shadow-xs"
					>
						<p className="text-sm font-semibold text-foreground">{item.label}</p>
						<p className="text-xs text-muted-foreground mt-1">{item.cue}</p>
						{item.samplePair ? (
							<p className="mt-2 text-xs font-mono text-muted-foreground/90">{item.samplePair}</p>
						) : null}
					</li>
				))}
			</ul>
			<Button asChild variant="outline" className="self-start text-sm">
				<a href={content.link.href} aria-label={content.link.label}>
					<span className="flex items-center gap-2">
						Go to practice
						<LinkIcon className="h-4 w-4" />
					</span>
				</a>
			</Button>
		</section>
	);
}

function TipsPracticeSection({
	content,
	activeTipId,
	onToggleTip,
}: {
	content: PhonemeDetailsPlanContent["tips"];
	activeTipId: string | null;
	onToggleTip: (id: string | null) => void;
}) {
	return (
		<section aria-labelledby="tips-practice-heading" className="flex flex-col gap-4">
			<div>
				<h2 id="tips-practice-heading" className="text-base font-semibold">
					Tips & practice
				</h2>
				<p className="text-sm text-muted-foreground">{content.intro}</p>
			</div>
			<ul className="space-y-3">
				{content.items.map((tip) => {
					const isOpen = activeTipId === tip.id;
					return (
						<li key={tip.id}>
							<Collapsible open={isOpen} onOpenChange={(open) => onToggleTip(open ? tip.id : null)}>
								<CollapsibleTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="w-full justify-between text-left text-sm font-semibold"
										aria-expanded={isOpen}
									>
										<span>{tip.title}</span>
										<Play className="h-3 w-3" aria-hidden />
									</Button>
								</CollapsibleTrigger>
								<CollapsibleContent className="mt-3 rounded-xl border border-border/60 bg-background/70 p-4">
									<p className="text-sm text-muted-foreground">{tip.summary}</p>
									<p className="mt-2 text-sm leading-relaxed text-foreground">{tip.detail}</p>
									<div className="mt-3 flex flex-wrap items-center gap-3">
										{tip.audioSrc ? (
											<AudioControls src={tip.audioSrc} label={`${tip.title} tip audio`} />
										) : null}
										{tip.selfCheck ? (
											<span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
												Self check: {tip.selfCheck}
											</span>
										) : null}
									</div>
								</CollapsibleContent>
							</Collapsible>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

function DividerLabel({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			<Separator className="bg-border/60 flex-1" decorative />
			<span className="shrink-0">{children}</span>
			<Separator className="bg-border/60 flex-1" decorative />
		</div>
	);
}
