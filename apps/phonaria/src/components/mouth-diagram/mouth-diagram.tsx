import { Dialog, DialogContent, DialogTitle } from "@phonaria/ui/components/dialog";
import { Maximize2, Pause, Play, Tags } from "lucide-react";
import {
	type ComponentProps,
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
	FOLDS_MIDDLE,
	HEAD_PATH,
	LARYNX_BACK_PATH,
	LOWER_TOOTH_PATH,
	NECK_PATH,
	PALATE_PATH,
	UPPER_TOOTH_PATH,
	VIEW_BOX,
} from "./model";
import type { LabelId, MouthSound } from "./sounds";

/**
 * How long a diagram plays by itself before it comes to rest. It sits beside
 * text people are reading, so it shows the sound and then keeps still.
 */
const AUTOPLAY_MS = 8000;

/**
 * A side view of the mouth that shows how a sound is made: air travels up from
 * the lungs, and the vocal folds open, buzz or shut. A sound that can be held
 * keeps the mouth still; one that has to move plays its steps in a loop.
 *
 * It plays for a few seconds when it comes into view, then rests on the
 * sound's main position until played again. With reduced motion on, nothing
 * moves until played. Its controls sit in the empty corners of the drawing.
 */
export function MouthDiagram({
	sound,
	title,
	large = false,
	className,
}: {
	sound: MouthSound;
	/** What the drawing is called for people who can't see it. */
	title?: string;
	/** The lightbox's copy: it keeps playing, names every part, and can't be enlarged again. */
	large?: boolean;
	className?: string;
}) {
	const { steps } = sound;
	const keyIndex = Math.max(
		0,
		steps.findIndex((step) => step.key),
	);
	const [stepIndex, setStepIndex] = useState(keyIndex);
	const [playing, setPlaying] = useState(false);
	const [allLabels, setAllLabels] = useState(large);
	const [enlarged, setEnlarged] = useState(false);
	// `still` is the main position: drawn before anything runs, and all there is without scripts.
	const { engine, still } = useMemo(() => {
		const engine = new MouthEngine(steps);
		return { engine, still: engine.seek(keyIndex) };
	}, [steps, keyIndex]);
	const scene = useRef<SceneHandle>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(true);
	/** Milliseconds left before it comes to rest; endless once someone presses play. */
	const playLeft = useRef(0);

	const show = (frame: Frame) => {
		scene.current?.paint(frame);
		setStepIndex(frame.stepIndex);
	};

	useEffect(() => {
		scene.current?.paint(still);
		setStepIndex(still.stepIndex);
		playLeft.current = large ? Number.POSITIVE_INFINITY : AUTOPLAY_MS;
		setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	}, [still, large]);

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
		if (!playing || !visible || enlarged) return;
		let request = 0;
		let last = performance.now();
		const loop = (now: number) => {
			// A long gap (a background tab) must not fling the air across the mouth, and the
			// first frame's clock can read earlier than the moment the loop was set up.
			const elapsed = Math.max(0, Math.min(48, now - last));
			last = now;
			const frame = engine.advance(elapsed);
			scene.current?.paint(frame);
			setStepIndex(frame.stepIndex);
			playLeft.current -= elapsed;
			if (playLeft.current <= 0 && frame.stepIndex === keyIndex && frame.holding) {
				setPlaying(false);
				return;
			}
			request = requestAnimationFrame(loop);
		};
		request = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(request);
	}, [playing, visible, enlarged, engine, keyIndex]);

	const labels = allLabels ? ALL_LABELS : sound.focus;
	const togglePlaying = () => {
		playLeft.current = Number.POSITIVE_INFINITY;
		setPlaying(!playing);
	};
	const goTo = (index: number) => {
		setPlaying(false);
		show(engine.seek(index));
	};

	return (
		<div className={className}>
			<div
				ref={frameRef}
				className="relative aspect-square w-full overflow-hidden rounded-2xl bg-diagram"
			>
				<Scene
					ref={scene}
					title={title ?? `Side view of the mouth making /${sound.ipa}/`}
					initial={still}
					labels={labels}
				/>
				{labels.map((id) => (
					<span
						key={id}
						className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-diagram px-2 py-0.5 text-xs font-medium whitespace-nowrap text-diagram-tooth"
						style={{ left: `${LABELS[id].at[0] / 5}%`, top: `${LABELS[id].at[1] / 5}%` }}
					>
						{LABELS[id].text}
					</span>
				))}

				<div className="absolute bottom-2 left-2 flex items-center gap-0.5">
					<OverlayButton label={playing ? "Pause" : "Play"} onClick={togglePlaying}>
						{playing ? <Pause /> : <Play />}
					</OverlayButton>
					{steps.length > 1 ? (
						<div role="group" aria-label="Steps" className="flex items-center">
							{steps.map((_, index) => (
								<StepBar
									key={index}
									label={`Step ${index + 1} of ${steps.length}`}
									current={index === stepIndex}
									onClick={() => goTo(index)}
								/>
							))}
						</div>
					) : null}
				</div>

				<div className="absolute top-2 right-2 flex items-center gap-1">
					<OverlayButton
						label={allLabels ? "Hide part names" : "Name every part"}
						pressed={allLabels}
						onClick={() => setAllLabels(!allLabels)}
					>
						<Tags />
					</OverlayButton>
					{large ? null : (
						// A phone has no room to show it any bigger.
						<OverlayButton
							label="Enlarge"
							className="hidden sm:flex"
							onClick={() => setEnlarged(true)}
						>
							<Maximize2 />
						</OverlayButton>
					)}
				</div>
			</div>

			{large ? null : (
				<Dialog open={enlarged} onOpenChange={setEnlarged}>
					<DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
						<DialogTitle className="font-display text-xl">
							/{sound.ipa}/{" "}
							<span className="text-sm font-normal text-muted-foreground">
								as in {sound.example}
							</span>
						</DialogTitle>
						<MouthDiagram sound={sound} title={title} large />
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

/**
 * The sound's main position as a still picture, for places too small to play
 * it or name its parts. Decorative: whatever sits beside it says what it shows.
 */
export function MouthStill({ sound, className }: { sound: MouthSound; className?: string }) {
	const still = useMemo(() => {
		const keyIndex = sound.steps.findIndex((step) => step.key);
		return new MouthEngine(sound.steps).seek(Math.max(0, keyIndex));
	}, [sound]);
	return (
		<div
			aria-hidden="true"
			className={cn("aspect-square w-full overflow-hidden rounded-2xl bg-diagram", className)}
		>
			<Scene title="" initial={still} labels={NO_LABELS} />
		</div>
	);
}

const NO_LABELS: readonly LabelId[] = [];

/** One step of a moving sound, as a short bar: bright for the step being shown. */
function StepBar({
	label,
	current,
	...props
}: ComponentProps<"button"> & { label: string; current: boolean }) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			aria-current={current ? "step" : undefined}
			className="group flex h-7 w-4 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-diagram-air"
			{...props}
		>
			<span
				className={cn(
					"h-1 w-3 rounded-full transition-colors group-hover:bg-diagram-tooth motion-reduce:transition-none",
					current ? "bg-diagram-tooth" : "bg-diagram-tissue",
				)}
			/>
		</button>
	);
}

/** A small round control laid over the drawing. It inverts when hovered or pressed. */
function OverlayButton({
	label,
	pressed,
	className,
	...props
}: ComponentProps<"button"> & { label: string; pressed?: boolean }) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			aria-pressed={pressed}
			className={cn(
				"flex size-7 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-diagram-air motion-reduce:transition-none [&_svg]:size-3.5",
				pressed
					? "bg-diagram-tooth text-diagram"
					: "bg-diagram text-diagram-tooth hover:bg-diagram-tooth hover:text-diagram",
				className,
			)}
			{...props}
		/>
	);
}

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
	ref?: Ref<SceneHandle>;
	title: string;
	initial: Frame;
	labels: readonly LabelId[];
}) {
	const gradientId = useId();
	const fadeId = useId();
	const jawClipId = useId();
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
	const contact = useRef<SVGCircleElement>(null);

	useImperativeHandle(ref, () => ({
		paint(frame) {
			jawBack.current?.setAttribute("transform", frame.shapes.jaw);
			jawFront.current?.setAttribute("transform", frame.shapes.jaw);
			jawBody.current?.setAttribute("d", frame.shapes.jawBody);
			tongue.current?.setAttribute("d", frame.shapes.tongue);
			velum.current?.setAttribute("d", frame.shapes.velum);
			upperLip.current?.setAttribute("d", frame.shapes.upperLip);
			airBright.current?.setAttribute("d", frame.air.bright);
			airFaint.current?.setAttribute("d", frame.air.faint);
			air.current?.setAttribute("opacity", frame.air.opacity.toFixed(2));

			folds.current?.setAttribute("d", frame.folds);
			folds.current?.setAttribute("stroke", voiceColor(frame, "var(--diagram-tooth)"));
			buzz.current?.setAttribute("opacity", (frame.buzz * 0.3).toFixed(2));
			ripples.current?.childNodes.forEach((ripple, index) => {
				(ripple as SVGPathElement).setAttribute(
					"opacity",
					(frame.ripples[index as 0 | 1 | 2] * 0.9).toFixed(2),
				);
			});

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
				<linearGradient
					id={gradientId}
					gradientUnits="userSpaceOnUse"
					x1="0"
					y1="335"
					x2="0"
					y2="382"
				>
					<stop offset="0" stopColor="var(--diagram-tongue)" />
					<stop offset="1" stopColor="var(--diagram-tissue)" />
				</linearGradient>
				<linearGradient
					id={`${fadeId}-ramp`}
					gradientUnits="userSpaceOnUse"
					x1="0"
					y1="0"
					x2="64"
					y2="0"
				>
					<stop offset="0" stopColor="black" />
					<stop offset="1" stopColor="white" />
				</linearGradient>
				<mask id={fadeId} maskUnits="userSpaceOnUse" x={-20} y={-20} width={540} height={540}>
					<rect x={-20} y={-20} width={540} height={540} fill={`url(#${fadeId}-ramp)`} />
				</mask>
				{/* The back of the jaw may slide under the neck, never past it into the throat. */}
				<clipPath id={jawClipId}>
					<rect x={-20} y={-20} width={402} height={560} />
				</clipPath>
			</defs>

			<g clipPath={`url(#${jawClipId})`}>
				<g ref={jawBack} transform={shapes.jaw}>
					<path ref={jawBody} d={shapes.jawBody} className="fill-diagram-tissue" />
				</g>
			</g>
			<path ref={tongue} d={shapes.tongue} fill={`url(#${gradientId})`} />
			<g className="fill-diagram-tissue">
				<path d={NECK_PATH} />
				<path d={HEAD_PATH} />
				<path d={LARYNX_BACK_PATH} />
				<path d={PALATE_PATH} />
				<path ref={upperLip} d={shapes.upperLip} />
				<path ref={velum} d={shapes.velum} />
			</g>
			<path d={UPPER_TOOTH_PATH} className="fill-diagram-tooth" />
			<g ref={jawFront} transform={shapes.jaw}>
				<path d={LOWER_TOOTH_PATH} className="fill-diagram-tooth" />
			</g>

			<circle
				ref={buzz}
				cx={FOLDS_MIDDLE[0]}
				cy={FOLDS_MIDDLE[1]}
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
				<path d="M334 449Q327 462 334 475" opacity={0} />
				<path d="M324 443Q314 462 324 481" opacity={0} />
				<path d="M314 437Q301 462 314 487" opacity={0} />
			</g>
			<path
				ref={folds}
				d={initial.folds}
				stroke={initialVoiceColor}
				strokeWidth={5}
				strokeLinecap="round"
				fill="none"
			/>

			<g
				ref={air}
				mask={`url(#${fadeId})`}
				opacity={initial.air.opacity}
				fill="none"
				strokeLinejoin="round"
				strokeLinecap="round"
				className="stroke-diagram-air"
				strokeWidth={4.4}
			>
				{/* One dot per puff, drawn as zero-length round-capped strokes. */}
				<path ref={airFaint} d={initial.air.faint} opacity={0.4} />
				<path ref={airBright} d={initial.air.bright} />
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

			{labels.map((id) => (
				<Leader key={id} {...LABELS[id]} />
			))}
		</svg>
	);
});

/** The voice colour while the folds buzz or are pressed shut, `quiet` while they rest apart. */
const voiceColor = (frame: Frame, quiet: string) =>
	frame.voice === "off" ? quiet : "var(--diagram-voice)";

type LabelSpec = {
	text: string;
	/** Centre of the tag. */
	at: Point;
	/** The part it names; a line runs to it. */
	target?: Point;
};

const LABELS: Record<LabelId, LabelSpec> = {
	ridge: { text: "alveolar ridge", at: [112, 62], target: [153, 173] },
	roof: { text: "hard palate", at: [240, 94], target: [250, 137] },
	softPalate: { text: "soft palate", at: [388, 104], target: [345, 142] },
	nose: { text: "nose", at: [222, 48] },
	tongue: { text: "tongue", at: [285, 300] },
	lips: { text: "lips", at: [40, 294], target: [102, 262] },
	folds: { text: "vocal cords", at: [292, 434], target: [372, 474] },
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
