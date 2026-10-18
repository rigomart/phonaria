import { Button } from "@phonaria/ui/components/button";
import { MapPin, XIcon } from "lucide-react";
import { useId, useLayoutEffect, useRef } from "react";
import { formatMaybeEra } from "@/lib/language-spread/era";
import type { Source, Stop, StopKind } from "@/lib/language-spread/types";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const KIND_LABELS: Record<StopKind, string> = {
	family: "Language family",
	branch: "Branch of a family",
	language: "Language",
	change: "Change in the language",
};

export function KindMark({ kind, className }: { kind: StopKind; className?: string }) {
	return (
		<span
			aria-hidden
			className={cn(
				"block shrink-0",
				kind === "family" && "size-2.5 rounded-full bg-map-route",
				kind === "branch" && "size-2.5 rounded-full border-2 border-map-route",
				kind === "language" && "m-px size-2 rotate-45 rounded-xs bg-map-pin",
				kind === "change" && "m-px size-2 rotate-45 rounded-xs border-2 border-map-pin",
				className,
			)}
		/>
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

export function StopDetails({
	stop,
	sources,
	onClose,
	leaving = false,
	onLeft,
}: {
	stop: Stop;
	sources: readonly Source[];
	onClose: () => void;
	/** Closed: plays its exit, hidden from everyone, then calls `onLeft`. */
	leaving?: boolean;
	onLeft?: () => void;
}) {
	const headingId = useId();
	const panel = useRef<HTMLElement>(null);
	useLayoutEffect(() => {
		const element = panel.current;
		if (!leaving || !element) return;
		if (prefersReducedMotion()) {
			onLeft?.();
			return;
		}
		for (const animation of element.getAnimations()) animation.cancel();
		const exit = element.animate(
			[
				{ opacity: 1, scale: 1 },
				{ opacity: 0, scale: 0.96 },
			],
			{ duration: 160, easing: EASE.exit, fill: "forwards" },
		);
		exit.onfinish = () => onLeft?.();
		return () => exit.cancel();
	}, [leaving, onLeft]);
	return (
		<section
			ref={panel}
			aria-labelledby={headingId}
			aria-hidden={leaving || undefined}
			inert={leaving}
			data-stop-details={leaving ? undefined : stop.id}
			className={cn(
				"max-h-full overflow-y-auto rounded-xl border bg-card p-3 text-card-foreground shadow-float enter-scale",
				!leaving && "pointer-events-auto",
			)}
		>
			<div className="flex items-start gap-2.5">
				<KindMark kind={stop.kind} className="mt-1.5" />
				<div className="min-w-0 flex-1">
					<h3 id={headingId} className="font-display text-sm font-semibold leading-snug">
						{stop.name}
					</h3>
					<p className="text-xs text-muted-foreground">
						{KIND_LABELS[stop.kind]}, {formatMaybeEra(stop.era)}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon-xs"
					className="-mt-0.5 -mr-0.5"
					aria-label={`Close ${stop.name}`}
					onClick={onClose}
				>
					<XIcon />
				</Button>
			</div>
			<p className="mt-2 text-xs leading-relaxed text-pretty md:text-sm md:leading-relaxed">
				{stop.description}
			</p>
			<p className="mt-2.5 flex gap-1.5 border-t pt-2.5 text-xs text-muted-foreground">
				<MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
				<span>Roughly {stop.where}. The pin marks the general area, not an exact spot.</span>
			</p>
			<details className="mt-2.5 text-xs text-muted-foreground">
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
