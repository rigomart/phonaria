import { Button } from "@phonaria/ui/components/button";
import { MapPin, XIcon } from "lucide-react";
import { type CSSProperties, useId } from "react";
import type { Bounds, Insets } from "@/lib/language-spread/camera";
import { formatEra, formatMaybeEra } from "@/lib/language-spread/era";
import { MAP_HEIGHT, MAP_WIDTH, project } from "@/lib/language-spread/projection";
import { routeHead, routePath } from "@/lib/language-spread/route-path";
import type { LonLat, Source, Step, Stop, StopKind } from "@/lib/language-spread/types";
import { WORLD_LAND_PATH } from "@/lib/language-spread/world-land";
import { cn } from "@/lib/utils";
import { useMapCamera } from "./use-map-camera";

/** Copies of everything drawn on the map, so the camera can pan across the Pacific. */
const TILES = [-MAP_WIDTH, 0, MAP_WIDTH];
const UNITS_PER_KM = MAP_WIDTH / 40075;

export const KIND_LABELS: Record<StopKind, string> = {
	migration: "Human migration",
	family: "Language family",
	branch: "Branch of a family",
	language: "Language",
};

/** A stroke that stays the same on screen at any zoom. `--u` is map units per pixel. */
const screenStroke = (px: number): CSSProperties => ({
	strokeWidth: `calc(var(--u, 1) * ${px}px)`,
});

type Phase = "past" | "current" | "future";

const phaseOf = (stepIndex: number, active: number): Phase =>
	stepIndex < active ? "past" : stepIndex === active ? "current" : "future";

export function SpreadMap({
	steps,
	stops,
	sources,
	active,
	selected,
	onSelect,
	getInsets,
	layout,
	reducedMotion,
}: {
	steps: readonly Step[];
	stops: ReadonlyMap<string, Stop>;
	sources: ReadonlyMap<string, Source>;
	active: number;
	selected: Stop | null;
	onSelect: (stop: Stop | null, opener?: HTMLElement) => void;
	getInsets: (container: HTMLElement) => Insets;
	layout: number;
	reducedMotion: boolean;
}) {
	const step = steps[active];
	const { containerRef, planeRef, svgRef, clipRef, registerMarker, ready } = useMapCamera({
		target: step.camera as Bounds,
		getInsets,
		layout,
		reducedMotion,
	});
	const ids = { land: useId(), glow: useId(), clip: useId(), details: useId() };

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 overflow-hidden bg-map-water [--tilt:28deg]"
			role="region"
			aria-label="Map of where languages spread. Places are approximate."
		>
			<div
				ref={planeRef}
				className="absolute inset-0 origin-center transform-3d [transform:rotateX(var(--tilt))]"
			>
				<svg
					ref={svgRef}
					className="absolute inset-0 size-full"
					viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
					preserveAspectRatio="xMidYMid meet"
					aria-hidden
					onClick={() => onSelect(null)}
				>
					<defs>
						<path id={ids.land} d={WORLD_LAND_PATH} />
						<radialGradient id={ids.glow}>
							<stop offset="0" stopColor="var(--map-area)" />
							<stop offset="0.55" stopColor="var(--map-area)" stopOpacity="0.5" />
							<stop offset="1" stopColor="var(--map-area)" stopOpacity="0" />
						</radialGradient>
						<clipPath id={ids.clip}>
							<rect ref={clipRef} x={0} y={-MAP_HEIGHT} width={MAP_WIDTH} height={MAP_HEIGHT * 3} />
						</clipPath>
					</defs>
					<g clipPath={`url(#${ids.clip})`}>
						{TILES.map((dx) => (
							<g key={dx} transform={`translate(${dx} 0)`}>
								<use
									href={`#${ids.land}`}
									className="fill-map-land stroke-map-coast"
									style={screenStroke(0.75)}
								/>
								{steps.map((owner, stepIndex) =>
									owner.stops.map((id) => {
										const stop = stops.get(id);
										if (!stop?.areaKm) return null;
										const { x, y } = project(...stop.at);
										return (
											<circle
												key={id}
												cx={x.toFixed(1)}
												cy={y.toFixed(1)}
												r={(stop.areaKm * UNITS_PER_KM).toFixed(1)}
												fill={`url(#${ids.glow})`}
												className={cn(
													"transition-opacity duration-700 motion-reduce:transition-none",
													stepIndex > active && "opacity-0",
													stepIndex < active && "opacity-40",
												)}
											/>
										);
									}),
								)}
								{steps.map((owner, stepIndex) =>
									owner.routes.map((route, routeIndex) => (
										<SpreadRoute
											key={`${owner.id}-${routeIndex}`}
											route={route}
											phase={phaseOf(stepIndex, active)}
											delay={routeIndex * 180}
										/>
									)),
								)}
							</g>
						))}
					</g>
				</svg>

				<ul
					aria-label="Places on the map"
					className={cn("absolute inset-0 transform-3d", !ready && "invisible")}
				>
					{steps.flatMap((owner, stepIndex) =>
						owner.stops.map((id, order) => {
							const stop = stops.get(id);
							if (!stop) return null;
							const { x, y } = project(...stop.at);
							return (
								<Pin
									key={id}
									stop={stop}
									phase={phaseOf(stepIndex, active)}
									order={order}
									selected={selected?.id === id}
									detailsId={ids.details}
									onSelect={onSelect}
									pinRef={registerMarker(id, x, y)}
								/>
							);
						}),
					)}
				</ul>
			</div>

			{/* Haze toward the horizon, so the tilted plane reads as depth. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-map-water to-transparent"
			/>

			<EraDial era={formatEra(step.era)} active={active} steps={steps} />

			<div
				id={ids.details}
				aria-live="polite"
				className="pointer-events-none absolute inset-x-3 top-24 z-20 md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:w-80"
			>
				{selected && (
					<StopDetails
						stop={selected}
						sources={selected.sources.flatMap((id) => sources.get(id) ?? [])}
						onClose={() => onSelect(null)}
					/>
				)}
			</div>
		</div>
	);
}

function SpreadRoute({
	route,
	phase,
	delay,
}: {
	route: readonly LonLat[];
	phase: Phase;
	delay: number;
}) {
	const points = route.map((place) => project(...place));
	const head = routeHead(points);
	const drawn = phase !== "future";
	return (
		<g
			className={cn(
				"transition-[stroke,fill] duration-500 motion-reduce:transition-none",
				phase === "past"
					? "fill-map-route-past stroke-map-route-past"
					: "fill-map-route stroke-map-route",
			)}
		>
			<path
				d={routePath(points)}
				pathLength={1}
				fill="none"
				strokeLinecap="butt"
				className="transition-[stroke-dashoffset] duration-900 ease-emphasized motion-reduce:transition-none"
				style={{
					...screenStroke(phase === "past" ? 1.5 : 2),
					strokeDasharray: 1,
					strokeDashoffset: drawn ? 0 : 1,
					transitionDelay: drawn ? `${delay}ms` : "0ms",
				}}
			/>
			<path
				d="M0 0L-9 -5L-9 5Z"
				stroke="none"
				className="transition-opacity duration-200 motion-reduce:transition-none"
				style={{
					transform: `translate(${head.x}px, ${head.y}px) rotate(${head.angle}deg) scale(var(--u, 1))`,
					opacity: drawn ? 1 : 0,
					transitionDelay: drawn ? `${delay + 750}ms` : "0ms",
				}}
			/>
		</g>
	);
}

/** Stem heights for the current step's pins, staggered so labels of nearby places don't collide. */
const CURRENT_STEMS = ["h-7", "h-14", "h-10", "h-18"];

/**
 * A place, drawn as a pin standing up from the tilted map: a dot on the ground,
 * a stem, and a head that faces the reader. The head is the button.
 */
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
	pinRef: (element: HTMLElement | null) => void;
}) {
	const revealed = phase !== "future";
	const current = phase === "current";
	const delay = { transitionDelay: revealed ? `${350 + order * 140}ms` : "0ms" };
	return (
		<li ref={pinRef} className="absolute top-0 left-0 transform-3d" inert={!revealed}>
			<span
				aria-hidden
				className={cn(
					"absolute size-1.5 -translate-1/2 rounded-full bg-map-pin transition-opacity duration-300 motion-reduce:transition-none",
					!revealed && "opacity-0",
				)}
				style={delay}
			/>
			<div className="absolute bottom-0 left-0 flex origin-bottom flex-col items-center transform-3d [transform:translateX(-50%)_rotateX(calc(var(--tilt)*-1))]">
				<button
					type="button"
					aria-label={`${stop.name}, ${formatMaybeEra(stop.era)}. ${KIND_LABELS[stop.kind]}, roughly ${stop.where}.`}
					aria-expanded={selected}
					aria-controls={detailsId}
					data-stop={stop.id}
					data-revealed={revealed || undefined}
					onClick={(event) => onSelect(selected ? null : stop, event.currentTarget)}
					className={cn(
						"group flex items-center gap-1.5 rounded-full border bg-card text-xs font-medium text-card-foreground shadow-sm",
						"transition-[opacity,translate,visibility,padding] duration-400 ease-emphasized motion-reduce:transition-none",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						current || selected ? "py-1 pr-2.5 pl-1.5" : "p-1.5",
						selected && "ring-2 ring-ring",
						!revealed && "invisible translate-y-2 opacity-0",
					)}
					style={delay}
				>
					<KindMark kind={stop.kind} />
					<span
						className={cn(
							"whitespace-nowrap",
							!(current || selected) && "hidden group-hover:inline group-focus-visible:inline",
						)}
					>
						{stop.name}
					</span>
				</button>
				<span
					aria-hidden
					className={cn(
						"w-px origin-bottom bg-map-pin transition-[scale,height] duration-500 ease-emphasized motion-reduce:transition-none",
						current || selected ? CURRENT_STEMS[order % CURRENT_STEMS.length] : "h-3.5",
						!revealed && "scale-y-0",
					)}
					style={delay}
				/>
			</div>
		</li>
	);
}

/** The mark for each kind of place, shared by pins, card chips and the legend. */
export function KindMark({ kind, className }: { kind: StopKind; className?: string }) {
	return (
		<span
			aria-hidden
			className={cn(
				"block shrink-0",
				kind === "migration" && "size-2.5 rounded-full border-2 border-map-pin",
				kind === "family" && "size-2.5 rounded-full bg-map-route",
				kind === "branch" && "size-2.5 rounded-full border-2 border-map-route",
				kind === "language" && "m-px size-2 rotate-45 rounded-xs bg-map-pin",
				className,
			)}
		/>
	);
}

/** The era in large numbers over a tick per story step: the page's clock. */
function EraDial({ era, active, steps }: { era: string; active: number; steps: readonly Step[] }) {
	return (
		<div className="pointer-events-none absolute inset-x-3 top-3 z-20 rounded-2xl border border-glass-border bg-glass px-4 py-3 shadow-float md:inset-x-auto md:top-6 md:right-6 md:min-w-64">
			<p
				key={era}
				data-era
				className="font-display text-2xl font-semibold tracking-tight whitespace-nowrap tabular-nums enter-rise md:text-3xl"
			>
				{era}
			</p>
			<ol aria-hidden className="mt-2 flex items-center gap-1">
				{steps.map((tick, index) => (
					<li
						key={tick.id}
						className={cn(
							"h-1 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none",
							index < active && "bg-map-route-past",
							index === active && "bg-map-route",
							index > active && "bg-border",
						)}
					/>
				))}
			</ol>
			<p className="sr-only">
				Step {active + 1} of {steps.length}
			</p>
			<p className="mt-2 text-xs text-muted-foreground">Dates and places are approximate</p>
		</div>
	);
}

export function SourceLink({ source }: { source: Source }) {
	return (
		<>
			<span className="font-medium">{source.citation}.</span>{" "}
			<a
				href={source.url}
				className="underline underline-offset-2 hover:text-muted-foreground"
				rel="noreferrer"
				target="_blank"
			>
				{source.title}
			</a>
		</>
	);
}

function StopDetails({
	stop,
	sources,
	onClose,
}: {
	stop: Stop;
	sources: readonly Source[];
	onClose: () => void;
}) {
	const headingId = useId();
	return (
		<section
			aria-labelledby={headingId}
			data-stop-details={stop.id}
			className="pointer-events-auto rounded-2xl border bg-card p-4 text-card-foreground shadow-float enter-scale"
		>
			<div className="flex items-start gap-3">
				<KindMark kind={stop.kind} className="mt-2" />
				<div className="min-w-0 flex-1">
					<h3 id={headingId} className="font-display text-base font-semibold leading-snug">
						{stop.name}
					</h3>
					<p className="text-xs text-muted-foreground">
						{KIND_LABELS[stop.kind]}, {formatMaybeEra(stop.era)}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					className="-mt-1 -mr-1"
					aria-label={`Close ${stop.name}`}
					onClick={onClose}
				>
					<XIcon />
				</Button>
			</div>
			<p className="mt-3 text-sm leading-relaxed text-pretty">{stop.description}</p>
			<p className="mt-3 flex gap-1.5 border-t pt-3 text-xs text-muted-foreground">
				<MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
				<span>Roughly {stop.where}. The pin marks the general area, not an exact spot.</span>
			</p>
			<details className="mt-3 text-xs text-muted-foreground">
				<summary className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					Sources ({sources.length})
				</summary>
				<ul className="mt-2 flex flex-col gap-1.5">
					{sources.map((source) => (
						<li key={source.id}>
							<SourceLink source={source} />
						</li>
					))}
				</ul>
			</details>
		</section>
	);
}
