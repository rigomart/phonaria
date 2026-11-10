import { Button } from "@phonaria/ui/components/button";
import { Toggle } from "@phonaria/ui/components/toggle";
import { Pause, Play, Tags } from "lucide-react";
import {
	memo,
	type Ref,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { type Frame, MouthEngine } from "./engine";
import type { Point } from "./geometry";
import {
	CAVITY_PATH,
	EPIGLOTTIS_PATH,
	FOLDS,
	HEAD_PATH,
	LOWER_TOOTH_PATH,
	UPPER_TOOTH_PATH,
	VIEW_BOX,
} from "./model";
import type { LabelId, MouthSound, Step } from "./sounds";

/** The vocal folds seen from above, in a circle below the chin. */
const INSET = { x: 62, y: 446, radius: 42 } as const;
const GLOTTIS = { top: INSET.y - 30, bottom: INSET.y + 24 } as const;

/**
 * A side view of the mouth that plays out how a sound is made: the tongue,
 * lips and soft palate move, air travels up from the lungs, and the vocal
 * folds open, buzz or shut. It loops until paused; with reduced motion on it
 * waits on the sound's main position until played.
 */
export function MouthDiagram({ sound, className }: { sound: MouthSound; className?: string }) {
	const { steps } = sound;
	const keyIndex = Math.max(
		0,
		steps.findIndex((step) => step.key),
	);
	const [stepIndex, setStepIndex] = useState(keyIndex);
	const [playing, setPlaying] = useState(false);
	const [allLabels, setAllLabels] = useState(false);
	// `still` is the main position: drawn before anything runs, and all there is without scripts.
	const { engine, still } = useMemo(() => {
		const engine = new MouthEngine(steps);
		return { engine, still: engine.seek(keyIndex) };
	}, [steps, keyIndex]);
	const scene = useRef<SceneHandle>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(true);

	const show = (frame: Frame) => {
		scene.current?.paint(frame);
		setStepIndex(frame.stepIndex);
	};

	// Start on the main position, then play unless motion is unwelcome.
	useEffect(() => {
		scene.current?.paint(still);
		setStepIndex(still.stepIndex);
		setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	}, [still]);

	useEffect(() => {
		const element = frameRef.current;
		if (!element) return;
		const observer = new IntersectionObserver(([entry]) =>
			setVisible(Boolean(entry?.isIntersecting)),
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!playing || !visible) return;
		let request = 0;
		let last = performance.now();
		const loop = (now: number) => {
			// A long gap (a background tab) must not fling the air across the mouth.
			show(engine.advance(Math.min(48, now - last)));
			last = now;
			request = requestAnimationFrame(loop);
		};
		request = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(request);
	}, [playing, visible, engine]);

	const step = steps[stepIndex] as Step;
	const goTo = (index: number) => {
		setPlaying(false);
		show(engine.seek(index));
	};

	return (
		<figure className={cn("flex flex-col gap-3", className)}>
			<div
				ref={frameRef}
				className="relative aspect-square w-full overflow-hidden rounded-2xl bg-diagram"
			>
				<Scene
					ref={scene}
					title={`Side view of the mouth making /${sound.ipa}/`}
					initial={still}
					labels={allLabels ? ALL_LABELS : sound.focus}
				/>
				{(allLabels ? ALL_LABELS : sound.focus).map((id) => (
					<span
						key={id}
						className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-diagram px-2 py-0.5 text-xs font-medium whitespace-nowrap text-diagram-tooth"
						style={{ left: `${LABELS[id].at[0] / 5}%`, top: `${LABELS[id].at[1] / 5}%` }}
					>
						{LABELS[id].text}
					</span>
				))}
				<StatusChips step={step} />
			</div>
			<figcaption className="min-h-10 text-sm text-foreground">{step.caption}</figcaption>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					aria-label={playing ? "Pause" : "Play"}
					onClick={() => setPlaying(!playing)}
				>
					{playing ? <Pause /> : <Play />}
				</Button>
				<div role="group" aria-label="Steps" className="flex items-center gap-1">
					{steps.map((_, index) => (
						<button
							key={index}
							type="button"
							aria-label={`Step ${index + 1} of ${steps.length}`}
							aria-current={index === stepIndex ? "step" : undefined}
							onClick={() => goTo(index)}
							className={cn(
								"flex size-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
								index === stepIndex
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{index + 1}
						</button>
					))}
				</div>
				<Toggle
					size="sm"
					variant="outline"
					className="ml-auto"
					pressed={allLabels}
					onPressedChange={setAllLabels}
				>
					<Tags aria-hidden="true" />
					Labels
				</Toggle>
			</div>
		</figure>
	);
}

/** What the voice and the air are doing in this step, in words. */
function StatusChips({ step }: { step: Step }) {
	const voice = { on: "Voice on", off: "Voice off", shut: "Vocal folds shut" }[step.voice];
	let air = "No air yet";
	if (step.voice === "shut") air = "Air held back";
	else if (step.flow && step.pose.velum > 0.5) air = "Air through the nose";
	else if (step.flow && step.stop) air = "Air held back";
	else if (step.flow) air = "Air through the mouth";
	return (
		<div className="pointer-events-none absolute top-2 right-2 flex flex-col items-end gap-1 text-xs font-medium text-diagram-tooth">
			<span className="flex items-center gap-1.5 rounded-full bg-diagram px-2 py-0.5">
				<span
					aria-hidden="true"
					className={cn(
						"size-2 rounded-full",
						step.voice === "on" ? "bg-diagram-voice" : "bg-diagram-tissue",
					)}
				/>
				{voice}
			</span>
			<span className="flex items-center gap-1.5 rounded-full bg-diagram px-2 py-0.5">
				<span
					aria-hidden="true"
					className={cn("size-2 rounded-full", step.flow ? "bg-diagram-air" : "bg-diagram-tissue")}
				/>
				{air}
			</span>
		</div>
	);
}

// --- The drawing ---

type SceneHandle = { paint: (frame: Frame) => void };

/**
 * The drawing. It renders the sound's main position once, and `paint` then
 * writes each frame straight to its elements, so playing never re-renders it.
 */
const Scene = memo(function Scene({
	ref,
	title,
	initial,
	labels,
}: {
	ref: Ref<SceneHandle>;
	title: string;
	initial: Frame;
	labels: readonly LabelId[];
}) {
	const gradientId = useId();
	const clipId = useId();
	const { shapes } = initial;
	const initialVoiceColor = voiceColor(initial, "var(--diagram-tooth)");
	const jawBack = useRef<SVGGElement>(null);
	const jawFront = useRef<SVGGElement>(null);
	const jawBody = useRef<SVGPathElement>(null);
	const tongue = useRef<SVGPathElement>(null);
	const velum = useRef<SVGPathElement>(null);
	const upperLip = useRef<SVGPathElement>(null);
	const air = useRef<SVGGElement>(null);
	const airBright = useRef<SVGPathElement>(null);
	const airFaint = useRef<SVGPathElement>(null);
	const folds = useRef<SVGPathElement>(null);
	const buzz = useRef<SVGCircleElement>(null);
	const ripples = useRef<SVGGElement>(null);
	const glottis = useRef<SVGPathElement>(null);
	const foldLeft = useRef<SVGLineElement>(null);
	const foldRight = useRef<SVGLineElement>(null);
	const insetRing = useRef<SVGCircleElement>(null);
	const contact = useRef<SVGCircleElement>(null);

	useImperativeHandle(ref, () => ({
		paint(frame) {
			jawBack.current?.setAttribute("transform", frame.shapes.jaw);
			jawFront.current?.setAttribute("transform", frame.shapes.jaw);
			jawBody.current?.setAttribute("d", frame.shapes.jawBody);
			tongue.current?.setAttribute("d", frame.shapes.tongue);
			velum.current?.setAttribute("d", frame.shapes.velum);
			upperLip.current?.setAttribute("d", frame.shapes.upperLip);
			airBright.current?.setAttribute("d", frame.airBright);
			airFaint.current?.setAttribute("d", frame.airFaint);
			air.current?.setAttribute("opacity", frame.airOpacity.toFixed(2));

			folds.current?.setAttribute("d", frame.folds);
			folds.current?.setAttribute("stroke", voiceColor(frame, "var(--diagram-tooth)"));
			buzz.current?.setAttribute("opacity", (frame.buzz * 0.3).toFixed(2));
			ripples.current?.childNodes.forEach((ripple, index) => {
				(ripple as SVGPathElement).setAttribute(
					"opacity",
					(frame.ripples[index as 0 | 1 | 2] * 0.9).toFixed(2),
				);
			});

			const half = frame.glottisHalfWidth;
			glottis.current?.setAttribute("d", glottisPath(half));
			foldLeft.current?.setAttribute("x2", String(INSET.x - half - 3));
			foldRight.current?.setAttribute("x2", String(INSET.x + half + 3));
			insetRing.current?.setAttribute("stroke", voiceColor(frame, "var(--diagram-tissue)"));

			const ring = contact.current;
			if (ring) {
				ring.setAttribute("opacity", frame.contact ? "1" : "0");
				if (frame.contact) {
					ring.setAttribute("cx", frame.contact.point[0].toFixed(1));
					ring.setAttribute("cy", frame.contact.point[1].toFixed(1));
					ring.setAttribute("r", frame.contact.radius.toFixed(1));
				}
			}
		},
	}));

	return (
		<svg viewBox={VIEW_BOX} role="img" aria-label={title} className="size-full">
			<defs>
				{/* The tongue fades into the flesh under it instead of ending in a hard edge. */}
				<linearGradient
					id={gradientId}
					gradientUnits="userSpaceOnUse"
					x1="0"
					y1="305"
					x2="0"
					y2="392"
				>
					<stop offset="0" stopColor="var(--diagram-tongue)" />
					<stop offset="1" stopColor="var(--diagram-tissue)" />
				</linearGradient>
				<clipPath id={clipId}>
					<circle cx={INSET.x} cy={INSET.y} r={INSET.radius} />
				</clipPath>
			</defs>

			<path d={HEAD_PATH} className="fill-diagram-tissue" />
			<path d={CAVITY_PATH} className="fill-diagram" />
			<path d={EPIGLOTTIS_PATH} className="fill-diagram-tissue" />
			<g ref={jawBack} transform={shapes.jaw}>
				<path ref={jawBody} d={shapes.jawBody} className="fill-diagram-tissue" />
			</g>
			<path ref={tongue} d={shapes.tongue} fill={`url(#${gradientId})`} />
			<path ref={velum} d={shapes.velum} className="fill-diagram-tissue" />
			<path ref={upperLip} d={shapes.upperLip} className="fill-diagram-tissue" />
			<path d={UPPER_TOOTH_PATH} className="fill-diagram-tooth" />
			<g ref={jawFront} transform={shapes.jaw}>
				<path d={LOWER_TOOTH_PATH} className="fill-diagram-tooth" />
			</g>

			{/* Voice: a glow around the voice box and ripples on the neck while the folds buzz. */}
			<circle
				ref={buzz}
				cx={(FOLDS.front + FOLDS.back) / 2}
				cy={FOLDS.y}
				r={30}
				opacity={initial.buzz * 0.3}
				className="fill-diagram-voice"
			/>
			<g
				ref={ripples}
				fill="none"
				strokeWidth={3}
				strokeLinecap="round"
				className="stroke-diagram-voice"
			>
				<path d="M246 426Q239 440 246 454" opacity={0} />
				<path d="M236 420Q226 440 236 460" opacity={0} />
				<path d="M226 414Q213 440 226 466" opacity={0} />
			</g>
			<path
				ref={folds}
				d={initial.folds}
				stroke={initialVoiceColor}
				strokeWidth={5}
				strokeLinecap="round"
				fill="none"
			/>

			{/* Air: one dot per puff, drawn as zero-length round-capped strokes. */}
			<g
				ref={air}
				fill="none"
				strokeWidth={4.4}
				strokeLinecap="round"
				className="stroke-diagram-air"
			>
				<path ref={airFaint} d={initial.airFaint} opacity={0.3} />
				<path ref={airBright} d={initial.airBright} />
			</g>

			<circle
				ref={contact}
				cx={initial.contact?.point[0]}
				cy={initial.contact?.point[1]}
				r={initial.contact?.radius ?? 11}
				opacity={initial.contact ? 1 : 0}
				fill="none"
				strokeWidth={2.5}
				strokeDasharray="5 4"
				className="stroke-diagram-voice"
			/>

			{/* The vocal folds from above: the front of the throat is at the top. */}
			<line
				x1={INSET.x + INSET.radius}
				y1={INSET.y - 4}
				x2={FOLDS.front - 2}
				y2={FOLDS.y}
				strokeWidth={1.5}
				strokeDasharray="3 5"
				className="stroke-diagram-tooth"
				opacity={0.6}
			/>
			<circle cx={INSET.x} cy={INSET.y} r={INSET.radius} className="fill-diagram-tissue" />
			<g clipPath={`url(#${clipId})`}>
				<path ref={glottis} d={glottisPath(initial.glottisHalfWidth)} className="fill-diagram" />
				<g strokeWidth={7} strokeLinecap="round" className="stroke-diagram-tooth">
					<line
						ref={foldLeft}
						x1={INSET.x}
						y1={GLOTTIS.top}
						x2={INSET.x - initial.glottisHalfWidth - 3}
						y2={GLOTTIS.bottom}
					/>
					<line
						ref={foldRight}
						x1={INSET.x}
						y1={GLOTTIS.top}
						x2={INSET.x + initial.glottisHalfWidth + 3}
						y2={GLOTTIS.bottom}
					/>
				</g>
			</g>
			<circle
				ref={insetRing}
				cx={INSET.x}
				cy={INSET.y}
				r={INSET.radius}
				fill="none"
				strokeWidth={3}
				stroke={voiceColor(initial, "var(--diagram-tissue)")}
			/>

			{labels.map((id) => (
				<Leader key={id} {...LABELS[id]} />
			))}
		</svg>
	);
});

/** The voice colour while the folds buzz or are pressed shut, `quiet` while they rest apart. */
const voiceColor = (frame: Frame, quiet: string) =>
	frame.voice === "off" ? quiet : "var(--diagram-voice)";

/** The opening between the folds: a point at the front, wider toward the back. */
function glottisPath(half: number): string {
	const { top, bottom } = GLOTTIS;
	return `M${INSET.x} ${top}L${INSET.x + half} ${bottom}Q${INSET.x} ${bottom + 8} ${INSET.x - half} ${bottom}Z`;
}

// --- Labels ---

type LabelSpec = {
	text: string;
	/** Centre of the tag. */
	at: Point;
	/** The part it names; a line runs to it. */
	target?: Point;
};

const LABELS: Record<LabelId, LabelSpec> = {
	ridge: { text: "gum ridge", at: [112, 62], target: [137, 209] },
	roof: { text: "roof of the mouth", at: [278, 40], target: [232, 167] },
	softPalate: { text: "soft palate", at: [418, 96], target: [336, 172] },
	nose: { text: "nose", at: [212, 128] },
	tongue: { text: "tongue", at: [248, 306] },
	lips: { text: "lips", at: [26, 312], target: [70, 262] },
	folds: { text: "vocal folds", at: [424, 440], target: [361, 440] },
	foldsAbove: { text: "seen from above", at: [84, 384] },
};

const ALL_LABELS = Object.keys(LABELS) as LabelId[];

/** The line from a tag to the part it names; the tag itself is text laid over the drawing. */
function Leader({ at, target }: LabelSpec) {
	if (!target) return null;
	const line = { x1: at[0], y1: at[1], x2: target[0], y2: target[1] };
	return (
		<g>
			{/* A dark line under a light one, so it shows on flesh and on the backdrop. */}
			<line {...line} strokeWidth={4} className="stroke-diagram" />
			<line {...line} strokeWidth={1.5} className="stroke-diagram-tooth" />
			<circle
				cx={target[0]}
				cy={target[1]}
				r={4}
				strokeWidth={1.5}
				className="fill-diagram stroke-diagram-tooth"
			/>
		</g>
	);
}
