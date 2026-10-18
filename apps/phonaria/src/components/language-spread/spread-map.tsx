import { Button } from "@phonaria/ui/components/button";
import { LocateFixed } from "lucide-react";
import type { RefCallback } from "react";
import type { Insets } from "@/lib/language-spread/camera";
import { formatMaybeEra } from "@/lib/language-spread/era";
import { type Phase, phaseOf, TIMING } from "@/lib/language-spread/scene";
import type { Step, Stop } from "@/lib/language-spread/types";
import { cn } from "@/lib/utils";
import { KIND_LABELS, KindMark } from "./stop-details";
import { useGlobe } from "./use-globe";

/**
 * Pins on the far side of the globe are hidden. Dragging turns the globe; the recenter button
 * returns it to the step's view.
 */
export function SpreadMap({
	steps,
	stops,
	detailsId,
	active,
	selected,
	onSelect,
	getInsets,
	layout,
	reducedMotion,
	onFocusLost,
	onReveal,
}: {
	steps: readonly Step[];
	stops: ReadonlyMap<string, Stop>;
	detailsId: string;
	active: number;
	selected: Stop | null;
	onSelect: (stop: Stop | null, opener?: HTMLElement) => void;
	getInsets: (container: HTMLElement) => Insets;
	layout: number;
	reducedMotion: boolean;
	/** Called when the focused pin or recenter button is about to be hidden. */
	onFocusLost?: () => void;
	/**
	 * Called once per step change with the step's index, as its arrows, areas
	 * and pins start to appear: about 60% into the flight, at once without a
	 * flight or with reduced motion, and on the first view at load. A step
	 * scrolled past before its reveal is reported when the next step starts.
	 */
	onReveal?: (index: number) => void;
}) {
	const { containerRef, canvasRef, pinRef, ready, away, recenter, isClick } = useGlobe({
		steps,
		stops,
		active,
		target: steps[active].camera,
		getInsets,
		layout,
		reducedMotion,
		onFocusLost,
		onReveal,
		detailsOpen: selected !== null,
	});

	return (
		<div
			ref={containerRef}
			className="group/globe absolute inset-0 overflow-clip bg-map-space"
			role="region"
			aria-label="Map of where languages spread. Places are approximate."
		>
			{/* Fingers spin the globe sideways; vertical swipes still scroll the story. */}
			<canvas
				ref={canvasRef}
				aria-hidden
				className="absolute inset-0 size-full cursor-grab touch-pan-y touch-pinch-zoom group-data-[camera=dragging]/globe:cursor-grabbing"
				onClick={() => {
					if (isClick()) onSelect(null);
				}}
			/>
			<ul
				aria-label="Places on the map"
				className={cn("pointer-events-none absolute inset-0", !ready && "invisible")}
			>
				{steps.flatMap((owner, stepIndex) =>
					owner.stops.map((id, order) => {
						const stop = stops.get(id);
						if (!stop) return null;
						return (
							<Pin
								key={id}
								stop={stop}
								phase={phaseOf(stepIndex, active)}
								order={order}
								selected={selected?.id === id}
								detailsId={detailsId}
								onSelect={onSelect}
								pinRef={pinRef(id, stop.at[0], stop.at[1])}
							/>
						);
					}),
				)}
			</ul>
			{away && (
				<Button
					data-recenter
					variant="ghost"
					size="icon-sm"
					aria-label="Recenter on this step"
					title="Recenter on this step"
					onClick={recenter}
					className="absolute z-20 mb-3 -translate-x-1/2 border-glass-border bg-glass shadow-float enter-scale"
					style={{ left: "var(--recenter-x)", bottom: "var(--recenter-bottom)" }}
				>
					<LocateFixed />
				</Button>
			)}
		</div>
	);
}

/** Stem heights for the current step's pins, staggered so labels of nearby places don't collide. */
const CURRENT_STEMS = ["h-7", "h-14", "h-10", "h-18"];

/** `pinRef` receives the element the globe moves, fades near the horizon, and hides on the far side. */
function Pin({
	stop,
	phase,
	order,
	selected,
	detailsId,
	onSelect,
	pinRef,
}: {
	stop: Stop;
	phase: Phase;
	order: number;
	selected: boolean;
	detailsId: string;
	onSelect: (stop: Stop | null, opener?: HTMLElement) => void;
	pinRef: RefCallback<HTMLElement>;
}) {
	const revealed = phase !== "future";
	const raised = phase === "current" || selected;
	// --pin-delay is set by the globe when a step changes, so pins appear as the camera arrives.
	const delay = {
		transitionDelay: revealed
			? `calc(var(--pin-delay, 0ms) + ${order * TIMING.pinStagger}ms)`
			: "0ms",
	};
	return (
		<li
			className={cn("absolute top-0 left-0", raised && "z-10", selected && "z-20")}
			inert={!revealed}
		>
			<div ref={pinRef} className="absolute top-0 left-0">
				<span
					aria-hidden
					className={cn(
						"absolute size-1.5 -translate-1/2 rounded-full bg-map-pin transition-opacity duration-300 motion-reduce:transition-none",
						!revealed && "opacity-0",
					)}
					style={delay}
				/>
				<div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
					<button
						type="button"
						aria-label={`${stop.name}, ${formatMaybeEra(stop.era)}. ${KIND_LABELS[stop.kind]}, roughly ${stop.where}.`}
						aria-expanded={selected}
						aria-controls={detailsId}
						data-stop={stop.id}
						data-revealed={revealed || undefined}
						onClick={(event) => onSelect(selected ? null : stop, event.currentTarget)}
						className={cn(
							"group pointer-events-auto flex items-center gap-1.5 rounded-full border bg-card text-xs font-medium text-card-foreground shadow-sm",
							"transition-[opacity,translate,visibility,padding] duration-400 ease-emphasized motion-reduce:transition-none",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							raised ? "py-1 pr-2.5 pl-1.5" : "p-1",
							selected && "ring-2 ring-ring",
							!revealed && "invisible translate-y-2 opacity-0",
						)}
						style={delay}
					>
						<KindMark kind={stop.kind} className={cn(!raised && "scale-75")} />
						<span
							className={cn(
								"whitespace-nowrap",
								!raised && "hidden group-hover:inline group-focus-visible:inline",
							)}
						>
							{stop.name}
						</span>
					</button>
					<span
						aria-hidden
						className={cn(
							"w-px origin-bottom bg-map-pin transition-[scale,height] duration-500 ease-emphasized motion-reduce:transition-none",
							raised ? CURRENT_STEMS[order % CURRENT_STEMS.length] : "h-1.5",
							!revealed && "scale-y-0",
						)}
						style={delay}
					/>
				</div>
			</div>
		</li>
	);
}
