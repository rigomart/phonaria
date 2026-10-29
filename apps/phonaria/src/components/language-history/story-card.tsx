import { ArrowDown, MoveRight } from "lucide-react";
import { useId, useLayoutEffect, useRef } from "react";
import { formatEra } from "@/lib/language-history/era";
import type { CardPlacement, Sample, Source, Step, Stop } from "@/lib/language-history/types";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { KindMark, SourceLink } from "./stop-details";

export const placementOf = (step: Step): CardPlacement => step.card ?? "center-left";

export const cardSide = (placement: CardPlacement) =>
	placement.endsWith("right") ? "right" : "left";

/** From md to lg the centered era dial would overlap a card at the top, so those sit at the middle. */
const PLACEMENT: Record<CardPlacement, string> = {
	"top-left": "md:items-center md:justify-start lg:items-start",
	"center-left": "md:items-center md:justify-start",
	"bottom-left": "md:items-end md:justify-start",
	"top-right": "md:items-center md:justify-end lg:items-start",
	"center-right": "md:items-center md:justify-end",
	"bottom-right": "md:items-end md:justify-end",
};

/** A card leaving: quick and quiet, so it is gone before the next one arrives. */
export const CARD_EXIT_MS = 180;
const CARD_ENTER_MS = 380;
const CARD_OFFSET_PX = 14;

function animateCard(card: HTMLElement, shown: boolean, direction: 1 | -1, side: "left" | "right") {
	for (const animation of card.getAnimations({ subtree: true })) animation.cancel();
	if (prefersReducedMotion()) return;
	if (!shown) {
		card.animate([{ opacity: 1 }, { opacity: 0, scale: 0.98 }], {
			duration: CARD_EXIT_MS,
			easing: EASE.exit,
		});
		return;
	}
	const phone = !window.matchMedia("(min-width: 48rem)").matches;
	const offset = CARD_OFFSET_PX * direction;
	const from = phone ? `0 ${offset}px` : `${side === "left" ? -offset : offset}px 0`;
	card.animate(
		[
			{ opacity: 0, translate: from },
			{ opacity: 1, translate: "0 0" },
		],
		{ duration: CARD_ENTER_MS, easing: EASE.emphasized },
	);
	Array.from(card.children).forEach((part, index) => {
		part.animate(
			[
				{ opacity: 0, translate: "0 4px" },
				{ opacity: 1, translate: "0 0" },
			],
			{
				duration: 280,
				delay: 40 + Math.min(index, 4) * 30,
				easing: EASE.emphasized,
				fill: "backwards",
			},
		);
	});
}

/**
 * A story step's card, held in a frame fixed over the map. Inactive cards stay readable to screen
 * readers, in story order, but their controls are inert and take no pointer events.
 */
export function StoryCard({
	step,
	sample,
	index,
	active,
	shown,
	direction,
	stops,
	sources,
	selectedId,
	onSelect,
	cardRef,
}: {
	step: Step;
	/** The version of the sample sentence shown with this card; its sources join the card's. */
	sample?: Sample;
	index: number;
	active: boolean;
	/** Visible: active, and its step has been revealed. */
	shown: boolean;
	/** 1 when the reader arrived going forward through the story, -1 going back. */
	direction: 1 | -1;
	stops: ReadonlyMap<string, Stop>;
	sources: ReadonlyMap<string, Source>;
	selectedId: string | undefined;
	onSelect: (stop: Stop | null, from?: HTMLElement) => void;
	cardRef: (card: HTMLElement | null) => void;
}) {
	const intro = index === 0;
	const Heading = intro ? "h1" : "h2";
	const headingId = useId();
	const places = step.stops.flatMap((id) => stops.get(id) ?? []);
	const placement = placementOf(step);
	const cardSources = [...(step.sources ?? []), ...(sample?.sources ?? [])];
	const card = useRef<HTMLElement | null>(null);
	const wasShown = useRef(shown);
	useLayoutEffect(() => {
		if (wasShown.current === shown || !card.current) return;
		wasShown.current = shown;
		animateCard(card.current, shown, direction, cardSide(placement));
	}, [shown, direction, placement]);
	return (
		<div
			className={cn(
				"pointer-events-none fixed inset-x-0 top-12 bottom-0 flex -translate-y-(--story-exit) items-end p-3 md:p-6 md:pt-28 lg:pt-6",
				PLACEMENT[placement],
			)}
		>
			<article
				ref={(element) => {
					card.current = element;
					cardRef(element);
				}}
				tabIndex={-1}
				aria-labelledby={headingId}
				className={cn(
					"max-h-1/2 w-full overflow-y-auto rounded-xl border border-glass-border bg-glass p-4 text-card-foreground shadow-float outline-none md:max-h-full md:w-80 xl:w-96",
					shown ? "pointer-events-auto opacity-100" : "opacity-0",
					intro && "enter-fade",
				)}
			>
				{!intro && (
					<p className="text-xs font-medium text-map-route tabular-nums">{formatEra(step.era)}</p>
				)}
				<Heading
					id={headingId}
					className={cn(
						"font-display font-semibold tracking-tight text-balance",
						intro ? "text-xl md:text-2xl" : "mt-0.5 text-base md:text-lg",
					)}
				>
					{step.title}
				</Heading>
				<div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-pretty">
					{step.paragraphs.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
				{intro && <Legend />}
				{places.length > 0 && (
					<ul aria-label="Places on the map" inert={!active} className="mt-3 flex flex-wrap gap-1">
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
											"inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
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
				{cardSources.length > 0 && (
					<details inert={!active} className="mt-3 text-xs text-muted-foreground">
						<summary className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							Sources for this card
						</summary>
						<ul className="mt-1.5 flex flex-col gap-1">
							{cardSources
								.flatMap((id) => sources.get(id) ?? [])
								.map((source) => (
									<li key={source.id}>
										<SourceLink source={source} />
									</li>
								))}
						</ul>
					</details>
				)}
				{intro && (
					<p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
						<ArrowDown className="size-3.5" aria-hidden />
						Scroll to travel through time
					</p>
				)}
			</article>
		</div>
	);
}

function Legend() {
	const items = [
		{ mark: <KindMark kind="family" />, label: "Language family" },
		{ mark: <KindMark kind="branch" />, label: "Branch of a family" },
		{ mark: <KindMark kind="language" />, label: "A single language" },
		{ mark: <KindMark kind="change" />, label: "A change in English" },
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
			className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-glass-border pt-3 text-xs text-muted-foreground"
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
