import { Button } from "@phonaria/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Ref, useLayoutEffect, useRef } from "react";
import type { Step } from "@/lib/language-spread/types";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ROLL_PX = 8;

/**
 * The page's clock: the era over a tick per story step, between buttons that
 * step through the story. Inactive cards' controls are inert, so these are how
 * keyboard and screen reader users move between steps without scrolling.
 */
export function EraDial({
	era,
	active,
	steps,
	onGoToStep,
	announcement,
	dialRef,
}: {
	era: string;
	active: number;
	steps: readonly Step[];
	onGoToStep: (index: number) => void;
	/** Read out politely after Previous or Next lands on a step; scrolling stays quiet. */
	announcement: string;
	dialRef?: Ref<HTMLDivElement>;
}) {
	const last = steps.length - 1;
	const current = useRef<HTMLParagraphElement>(null);
	const outgoing = useRef<HTMLSpanElement>(null);
	const previous = useRef({ active, era });
	useLayoutEffect(() => {
		const from = previous.current;
		previous.current = { active, era };
		const next = current.current;
		const ghost = outgoing.current;
		if (from.era === era || !next || !ghost || prefersReducedMotion()) return;
		const roll = (active > from.active ? 1 : -1) * ROLL_PX;
		ghost.textContent = from.era;
		for (const element of [next, ghost])
			for (const animation of element.getAnimations()) animation.cancel();
		ghost.animate(
			[
				{ opacity: 1, translate: "0 0" },
				{ opacity: 0, translate: `0 ${-roll}px` },
			],
			{ duration: 180, easing: EASE.exit, fill: "forwards" },
		);
		next.animate(
			[
				{ opacity: 0, translate: `0 ${roll}px` },
				{ opacity: 1, translate: "0 0" },
			],
			{ duration: 320, delay: 60, easing: EASE.emphasized, fill: "backwards" },
		);
	}, [active, era]);
	return (
		<div
			ref={dialRef}
			className="pointer-events-none absolute inset-x-3 top-3 z-20 rounded-xl border border-glass-border bg-glass px-1.5 py-1.5 shadow-float md:inset-x-auto md:top-6 md:left-1/2 md:w-64 md:-translate-x-1/2"
		>
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					className="pointer-events-auto"
					aria-label="Previous step"
					disabled={active === 0}
					focusableWhenDisabled
					onClick={() => onGoToStep(active - 1)}
				>
					<ChevronLeft />
				</Button>
				<div className="relative min-w-0 flex-1 text-center font-display text-base font-semibold tracking-tight whitespace-nowrap tabular-nums md:text-lg">
					<p ref={current} data-era>
						{era}
					</p>
					<span ref={outgoing} aria-hidden className="absolute inset-0 opacity-0" />
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					className="pointer-events-auto"
					aria-label="Next step"
					disabled={active === last}
					focusableWhenDisabled
					onClick={() => onGoToStep(active + 1)}
				>
					<ChevronRight />
				</Button>
			</div>
			<ol aria-hidden className="mx-2 mt-1 flex items-center gap-0.5">
				{steps.map((tick, index) => (
					<li
						key={tick.id}
						className={cn(
							"h-1 flex-1 rounded-full transition-[background-color,scale] duration-500 ease-emphasized motion-reduce:transition-none",
							index < active && "bg-map-route-past",
							index === active && "scale-y-150 bg-map-route",
							index > active && "bg-border",
						)}
					/>
				))}
			</ol>
			<p className="sr-only">
				Step {active + 1} of {steps.length}
			</p>
			<div role="status" className="sr-only">
				{announcement}
			</div>
			<p className="mt-1 mb-0.5 text-center text-xs text-muted-foreground">
				Dates and places are approximate
			</p>
		</div>
	);
}
