import { ArrowDown, MoveRight } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Insets } from "@/lib/language-spread/camera";
import { formatEra } from "@/lib/language-spread/era";
import { MAIN_SOURCES, SOURCES, STEPS, STOPS } from "@/lib/language-spread/story";
import type { Step, Stop } from "@/lib/language-spread/types";
import { cn } from "@/lib/utils";
import { KindMark, SourceLink, SpreadMap } from "./spread-map";
import { useActiveStep } from "./use-active-step";

const DESKTOP = "(min-width: 48rem)";
/** Room kept clear of the edges and the cards, in pixels. */
const EDGE = 24;

export function LanguageSpreadContent() {
	const stops = useMemo(() => new Map(STOPS.map((stop) => [stop.id, stop])), []);
	const { active, registerSection } = useActiveStep();
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const [selected, setSelected] = useState<Stop | null>(null);
	const opener = useRef<HTMLElement | null>(null);
	const cards = useRef<(HTMLElement | null)[]>([]);
	const activeRef = useRef(active);
	useLayoutEffect(() => {
		activeRef.current = active;
	}, [active]);

	// Cards cover the left column on wide screens and the bottom on phones, so the
	// camera frames each region in the space that is left.
	const getInsets = useCallback((container: HTMLElement): Insets => {
		const bounds = container.getBoundingClientRect();
		const card = cards.current[activeRef.current] ?? cards.current[0];
		const cardBounds = card?.getBoundingClientRect();
		if (window.matchMedia(DESKTOP).matches) {
			const left = cardBounds ? cardBounds.right - bounds.left + EDGE : 0;
			return { top: 96, right: EDGE, bottom: EDGE, left };
		}
		// On phones the era indicator spans the top of the map, so keep pins below it.
		return {
			top: 128,
			right: EDGE / 2,
			bottom: (cardBounds?.height ?? 0) + EDGE * 2,
			left: EDGE / 2,
		};
	}, []);

	const select = useCallback((stop: Stop | null, from?: HTMLElement) => {
		if (stop && from) opener.current = from;
		setSelected(stop);
		if (stop) return;
		// The opener may be a pin hidden again by scrolling back; fall back to the story.
		if (opener.current?.isConnected && !opener.current.closest("[inert]")) opener.current.focus();
		else cards.current[activeRef.current]?.focus();
	}, []);

	// Scrolling back hides later pins; keep keyboard focus out of them.
	useEffect(() => {
		if (document.activeElement?.closest("[inert]")) cards.current[active]?.focus();
	}, [active]);

	// On phones the active card covers the bottom of the map, and it grows when its
	// sources open, so the camera refits whenever its height changes.
	const [layout, setLayout] = useState(0);
	useEffect(() => {
		const card = cards.current[active];
		if (!card) return;
		let height = card.offsetHeight;
		const observer = new ResizeObserver(() => {
			if (card.offsetHeight === height) return;
			height = card.offsetHeight;
			setLayout((version) => version + 1);
		});
		observer.observe(card);
		return () => observer.disconnect();
	}, [active]);

	useEffect(() => {
		if (!selected) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") select(null);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [selected, select]);

	return (
		<div className="flex flex-col">
			<div className="relative">
				<div className="sticky top-12 h-[calc(100svh-3rem)]">
					<SpreadMap
						steps={STEPS}
						stops={stops}
						sources={sourcesById}
						active={active}
						selected={selected}
						onSelect={select}
						getInsets={getInsets}
						layout={layout}
						reducedMotion={reducedMotion}
					/>
				</div>
				<ol className="pointer-events-none relative z-10 mx-auto -mt-[calc(100svh-3rem)] w-full max-w-6xl px-3 sm:px-6">
					{STEPS.map((step, index) => (
						<li
							key={step.id}
							ref={registerSection(index)}
							data-step={step.id}
							aria-current={index === active ? "step" : undefined}
							className={cn(
								"flex min-h-[120svh] flex-col justify-end pt-10 pb-3 md:min-h-[150svh] md:justify-start md:pb-0",
								index === 0 ? "md:pt-8" : "md:pt-0",
							)}
						>
							<StoryCard
								step={step}
								index={index}
								active={index === active}
								stops={stops}
								selectedId={selected?.id}
								onSelect={select}
								cardRef={(card) => {
									cards.current[index] = card;
								}}
							/>
						</li>
					))}
				</ol>
			</div>
			<Sources />
		</div>
	);
}

function StoryCard({
	step,
	index,
	active,
	stops,
	selectedId,
	onSelect,
	cardRef,
}: {
	step: Step;
	index: number;
	active: boolean;
	stops: ReadonlyMap<string, Stop>;
	selectedId: string | undefined;
	onSelect: (stop: Stop | null, from?: HTMLElement) => void;
	cardRef: (card: HTMLElement | null) => void;
}) {
	const intro = index === 0;
	const Heading = intro ? "h1" : "h2";
	const headingId = useId();
	const places = step.stops.flatMap((id) => stops.get(id) ?? []);
	return (
		<article
			ref={cardRef}
			tabIndex={-1}
			aria-labelledby={headingId}
			className={cn(
				"pointer-events-auto sticky bottom-3 w-full rounded-2xl outline-none border border-glass-border bg-glass p-5 text-card-foreground shadow-float backdrop-blur-xl md:top-[22svh] md:bottom-auto md:max-w-md md:p-6",
				"transition-[opacity,scale] duration-500 ease-emphasized motion-reduce:transition-none",
				!active && "scale-97 opacity-60",
				intro && "enter-rise",
			)}
		>
			{!intro && (
				<p className="text-sm font-medium text-map-route tabular-nums">{formatEra(step.era)}</p>
			)}
			<Heading
				id={headingId}
				className={cn(
					"font-display font-semibold tracking-tight text-balance",
					intro ? "text-3xl md:text-4xl" : "mt-1 text-xl md:text-2xl",
				)}
			>
				{step.title}
			</Heading>
			<div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-pretty md:text-base md:leading-relaxed">
				{step.paragraphs.map((paragraph) => (
					<p key={paragraph}>{paragraph}</p>
				))}
			</div>
			{intro && <Legend />}
			{places.length > 0 && (
				<ul aria-label="Places on the map" className="mt-4 flex flex-wrap gap-1.5">
					{places.map((stop) => {
						const open = selectedId === stop.id;
						return (
							<li key={stop.id}>
								<button
									type="button"
									aria-expanded={open}
									aria-label={`${stop.name}, show details`}
									onClick={(event) => onSelect(open ? null : stop, event.currentTarget)}
									className={cn(
										"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
										"transition-colors motion-reduce:transition-none",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										open
											? "border-foreground bg-foreground text-background"
											: "border-glass-border bg-background hover:bg-muted",
									)}
								>
									<KindMark kind={stop.kind} />
									{stop.name}
								</button>
							</li>
						);
					})}
				</ul>
			)}
			{step.sources && (
				<details className="mt-4 text-xs text-muted-foreground">
					<summary className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						Sources for this card
					</summary>
					<ul className="mt-2 flex flex-col gap-1.5">
						{step.sources
							.flatMap((id) => sourcesById.get(id) ?? [])
							.map((source) => (
								<li key={source.id}>
									<SourceLink source={source} />
								</li>
							))}
					</ul>
				</details>
			)}
			{intro && (
				<p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
					<ArrowDown className="size-4" aria-hidden />
					Scroll to travel through time
				</p>
			)}
		</article>
	);
}

/** How to read the map, in the same marks the map uses. */
function Legend() {
	const items = [
		{ mark: <KindMark kind="migration" />, label: "People on the move" },
		{ mark: <KindMark kind="family" />, label: "Language family" },
		{ mark: <KindMark kind="branch" />, label: "Branch of a family" },
		{ mark: <KindMark kind="language" />, label: "A single language" },
		{
			mark: <span className="block size-3 shrink-0 rounded-full bg-map-area blur-[1.5px]" />,
			label: "Rough area",
		},
		{
			mark: <MoveRight className="size-3.5 shrink-0 text-map-route" />,
			label: "Direction of spread",
		},
	];
	return (
		<ul
			aria-label="How to read the map"
			className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-glass-border pt-4 text-xs text-muted-foreground"
		>
			{items.map(({ mark, label }) => (
				<li key={label} className="flex items-center gap-2">
					<span aria-hidden className="flex w-3.5 justify-center">
						{mark}
					</span>
					{label}
				</li>
			))}
		</ul>
	);
}

const sourcesById = new Map(SOURCES.map((source) => [source.id, source]));

function Sources() {
	const main = MAIN_SOURCES.flatMap((id) => sourcesById.get(id) ?? []);
	return (
		<section
			aria-labelledby="language-spread-sources"
			className="relative z-10 border-t bg-background"
		>
			<div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
				<h2 id="language-spread-sources" className="font-display text-xl font-semibold">
					Sources
				</h2>
				<p className="mt-2 text-sm text-muted-foreground text-pretty">
					Dates are rounded and places are general areas. Where experts disagree, the story says so.
					Each pin lists the studies behind it; these are the main works the story draws on.
				</p>
				<ul className="mt-4 flex flex-col gap-2 text-sm">
					{main.map((source) => (
						<li key={source.id}>
							<SourceLink source={source} />
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
