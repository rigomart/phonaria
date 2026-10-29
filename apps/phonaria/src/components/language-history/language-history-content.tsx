import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Insets } from "@/lib/language-history/camera";
import { coveredInsets } from "@/lib/language-history/covered-insets";
import { formatEra } from "@/lib/language-history/era";
import { MAIN_SOURCES, SAMPLES, SOURCES, STEPS, STOPS } from "@/lib/language-history/story";
import type { Stop } from "@/lib/language-history/types";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { HistoryMap } from "./history-map";
import { SampleCaption, SampleComparison } from "./sample-sentence";
import { SourceLink, StopDetails } from "./stop-details";
import { CARD_EXIT_MS, cardSide, placementOf, StoryCard } from "./story-card";
import { EraDial } from "./story-timeline";
import { useActiveStep } from "./use-active-step";

const DESKTOP = "(min-width: 48rem)";
const UI_MARGIN_PX = 24;
const REVEAL_FALLBACK_MS = 1600;

/** Box from offset*, which ignores any transform playing on the element. */
function layoutBox(element: HTMLElement) {
	const frame = element.offsetParent?.getBoundingClientRect();
	const left = (frame?.left ?? 0) + element.offsetLeft;
	const top = (frame?.top ?? 0) + element.offsetTop;
	return { left, top, right: left + element.offsetWidth, bottom: top + element.offsetHeight };
}

function underDialAndCaption(dial: HTMLElement | null, caption: HTMLElement | null) {
	const box = dial?.getBoundingClientRect();
	const below = caption?.getBoundingClientRect();
	if (!box || !below || below.height === 0) return box;
	return {
		top: box.top,
		left: box.left,
		right: box.right,
		bottom: Math.max(box.bottom, below.bottom),
	};
}

const sourcesById = new Map(SOURCES.map((source) => [source.id, source]));
const samplesByStep = new Map(
	SAMPLES.flatMap((sample) => (sample.step ? [[sample.step, sample]] : [])),
);

export function LanguageHistoryContent() {
	const stops = useMemo(() => new Map(STOPS.map((stop) => [stop.id, stop])), []);
	const { active, story, registerSection, goToStep } = useActiveStep();
	const detailsId = useId();
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const [selected, setSelected] = useState<Stop | null>(null);
	const opener = useRef<HTMLElement | null>(null);
	const cards = useRef<(HTMLElement | null)[]>([]);
	const dial = useRef<HTMLDivElement>(null);
	const caption = useRef<HTMLElement>(null);
	const activeRef = useRef(active);
	useLayoutEffect(() => {
		activeRef.current = active;
	}, [active]);

	const placement = placementOf(STEPS[active]);
	const side = cardSide(placement);

	const getInsets = useCallback((container: HTMLElement): Insets => {
		const desktop = window.matchMedia(DESKTOP).matches;
		const card = cards.current[activeRef.current];
		return coveredInsets({
			container: container.getBoundingClientRect(),
			card: card ? layoutBox(card) : undefined,
			dial: underDialAndCaption(dial.current, caption.current),
			margin: desktop ? UI_MARGIN_PX : UI_MARGIN_PX / 2,
			gap: UI_MARGIN_PX,
		});
	}, []);

	// Bumped during render, so the step change and the new placement plan one flight.
	const [layout, setLayout] = useState(0);
	const [placed, setPlaced] = useState(placement);
	if (placed !== placement) {
		setPlaced(placement);
		setLayout((version) => version + 1);
	}
	useEffect(() => {
		const box = caption.current;
		if (!box) return;
		let height = box.offsetHeight;
		const observer = new ResizeObserver(() => {
			if (box.offsetHeight === height) return;
			height = box.offsetHeight;
			setLayout((version) => version + 1);
		});
		observer.observe(box);
		return () => observer.disconnect();
	}, []);
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

	// The card enters on the globe's reveal for its step, not on the step change.
	const [revealed, setRevealed] = useState<{ index: number; direction: 1 | -1 } | null>({
		index: 0,
		direction: 1,
	});
	const travel = useRef({ previous: active, direction: 1 as 1 | -1, changedAt: 0 });
	const reported = useRef<number | null>(null);
	const revealTimer = useRef(0);
	const fallbackTimer = useRef(0);
	const reveal = useCallback((index: number) => {
		reported.current = index;
		if (index !== activeRef.current) return;
		window.clearTimeout(revealTimer.current);
		window.clearTimeout(fallbackTimer.current);
		const exitRemainingMs = Math.max(
			0,
			CARD_EXIT_MS - (performance.now() - travel.current.changedAt),
		);
		const { direction } = travel.current;
		revealTimer.current = window.setTimeout(
			() => setRevealed({ index, direction }),
			exitRemainingMs,
		);
	}, []);
	useLayoutEffect(() => {
		const { previous } = travel.current;
		if (previous === active) return;
		travel.current = {
			previous: active,
			direction: active > previous ? 1 : -1,
			changedAt: performance.now(),
		};
		window.clearTimeout(revealTimer.current);
		window.clearTimeout(fallbackTimer.current);
		if (prefersReducedMotion()) {
			setRevealed({ index: active, direction: 1 });
			return;
		}
		setRevealed(null);
		// With no flight, the globe reports the reveal during this same commit, before this runs.
		const alreadyRevealed = reported.current === active;
		reported.current = null;
		if (alreadyRevealed) reveal(active);
		else fallbackTimer.current = window.setTimeout(() => reveal(active), REVEAL_FALLBACK_MS);
	}, [active, reveal]);
	useEffect(
		() => () => {
			window.clearTimeout(revealTimer.current);
			window.clearTimeout(fallbackTimer.current);
		},
		[],
	);

	const focusActiveCard = useCallback(() => {
		cards.current[activeRef.current]?.focus({ preventScroll: true });
	}, []);

	const select = useCallback((stop: Stop | null, from?: HTMLElement) => {
		if (stop && from) opener.current = from;
		setSelected(stop);
		if (stop) return;
		const openerUsable = opener.current?.isConnected && !opener.current.closest("[inert]");
		if (openerUsable) opener.current?.focus();
		else cards.current[activeRef.current]?.focus();
	}, []);

	const requested = useRef<number | null>(null);
	const [announcement, setAnnouncement] = useState("");
	const goTo = useCallback(
		(index: number) => {
			requested.current = index;
			goToStep(index, reducedMotion);
		},
		[goToStep, reducedMotion],
	);

	// A key press on a dial button fires keydown before click, which makes a fresh request.
	useEffect(() => {
		const cancel = () => {
			requested.current = null;
		};
		const events = ["wheel", "touchstart", "keydown"] as const;
		for (const event of events) window.addEventListener(event, cancel, { passive: true });
		return () => {
			for (const event of events) window.removeEventListener(event, cancel);
		};
	}, []);

	// The browser drops focus from inert controls, so hand it to the visible card first.
	useLayoutEffect(() => {
		const card = cards.current[active];
		const requestedAndFocusStillOnDial =
			requested.current === active && !!dial.current?.contains(document.activeElement);
		requested.current = null;
		if (requestedAndFocusStillOnDial) {
			const step = STEPS[active];
			setAnnouncement(
				`Step ${active + 1} of ${STEPS.length}, ${formatEra(step.era)}: ${step.title}`,
			);
			card?.focus({ preventScroll: true });
			return;
		}
		const focused = document.activeElement;
		const inOtherCard = cards.current.some((other) => other !== card && other?.contains(focused));
		if (focused?.closest("[inert]") || inOtherCard) card?.focus({ preventScroll: true });
	}, [active]);

	const [leaving, setLeaving] = useState<Stop | null>(null);
	const [lastSelected, setLastSelected] = useState(selected);
	if (lastSelected !== selected) {
		setLastSelected(selected);
		setLeaving(selected ? null : lastSelected);
	}
	const clearLeaving = useCallback(() => setLeaving(null), []);
	const panelStop = selected ?? leaving;

	const detailsBox = useRef<HTMLDivElement>(null);
	const detailsLeft = useRef<number | null>(null);
	useLayoutEffect(() => {
		const box = detailsBox.current;
		if (!box) return;
		const left = box.getBoundingClientRect().left;
		const from = detailsLeft.current;
		detailsLeft.current = left;
		const panel = box.firstElementChild;
		if (from === null || from === left || !panel || prefersReducedMotion()) return;
		panel.animate([{ translate: `${from - left}px 0` }, { translate: "0 0" }], {
			duration: 600,
			easing: EASE.emphasized,
		});
	}, [side]);

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
					<HistoryMap
						steps={STEPS}
						stops={stops}
						detailsId={detailsId}
						active={active}
						selected={selected}
						onSelect={select}
						getInsets={getInsets}
						layout={layout}
						reducedMotion={reducedMotion}
						onFocusLost={focusActiveCard}
						onReveal={reveal}
					/>
					<EraDial
						era={formatEra(STEPS[active].era)}
						active={active}
						steps={STEPS}
						onGoToStep={goTo}
						announcement={announcement}
						dialRef={dial}
					/>
					<SampleCaption
						sample={samplesByStep.get(STEPS[active].id)}
						shown={revealed?.index === active}
						sizerRef={caption}
						cardSide={side}
					/>
					<div
						ref={detailsBox}
						id={detailsId}
						aria-live="polite"
						className={cn(
							"pointer-events-none absolute inset-x-3 top-24 bottom-3 z-20 flex flex-col md:inset-x-auto md:top-28 md:bottom-6 md:w-72 md:justify-end",
							side === "left" ? "md:right-6" : "md:left-6",
						)}
					>
						{panelStop && (
							<StopDetails
								key={panelStop.id}
								stop={panelStop}
								sources={panelStop.sources.flatMap((id) => sourcesById.get(id) ?? [])}
								onClose={() => select(null)}
								leaving={!selected}
								onLeft={clearLeaving}
							/>
						)}
					</div>
				</div>
				<ol ref={story} className="pointer-events-none relative z-10 -mt-[calc(100svh-3rem)]">
					{STEPS.map((step, index) => (
						<li
							key={step.id}
							ref={registerSection(index)}
							data-step={step.id}
							aria-current={index === active ? "step" : undefined}
							className="min-h-[120svh] md:min-h-[150svh]"
						>
							<StoryCard
								step={step}
								sample={samplesByStep.get(step.id)}
								index={index}
								active={index === active}
								shown={index === active && revealed?.index === index}
								direction={revealed?.direction ?? 1}
								stops={stops}
								sources={sourcesById}
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
			<SampleComparison sources={sourcesById} />
			<Sources />
		</div>
	);
}

function Sources() {
	const main = MAIN_SOURCES.flatMap((id) => sourcesById.get(id) ?? []);
	return (
		<section
			aria-labelledby="language-history-sources"
			className="relative z-10 border-t bg-background"
		>
			<div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
				<h2 id="language-history-sources" className="font-display text-lg font-semibold">
					Sources
				</h2>
				<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground text-pretty sm:text-sm">
					Dates are rounded, and places are rough areas. When experts disagree, the story says so.
					Each pin lists its own sources. These are the main works behind the whole story.
				</p>
				<ul className="mt-3 flex flex-col gap-1.5 text-xs leading-relaxed sm:text-sm">
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
