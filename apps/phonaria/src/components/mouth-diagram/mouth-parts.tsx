import type { ReactNode } from "react";
import type { Point } from "./geometry";
import {
	CAVITY_PATH,
	EPIGLOTTIS_PATH,
	FOLDS,
	HEAD_PATH,
	JAW_PIVOT,
	LOWER_TOOTH_PATH,
	NASAL,
	oralRouteFor,
	type Pose,
	shapesFor,
	TRUNK,
	UPPER_TOOTH_PATH,
	VIEW_BOX,
} from "./model";
import { MOUTH_SOUNDS, REST } from "./sounds";

/**
 * Prototype: each piece the mouth diagram is built from, drawn on its own over
 * a faint copy of the whole. A solid shape is the piece at rest; thin lines are
 * the other positions it takes. The cards are in the order the pieces are painted.
 */
export function MouthParts() {
	const rest = shapesFor(REST);
	const variant = (change: Partial<Pose>) => shapesFor({ ...REST, ...change });
	const jawShut = variant({ jaw: 0 });
	const jawOpen = variant({ jaw: 6 });
	const rounded = variant({ lipRound: 1 });
	const closed = variant({ lipClose: 1, jaw: 1.5 });
	const lowered = variant({ velum: 1 });
	const tonguePoses = uniqueTonguePoses();
	const oral = oralRouteFor(REST).track.points;

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<Part
				title="Head"
				note="Skull, face above the mouth, back wall of the throat and neck. It never moves."
			>
				<path d={HEAD_PATH} className="fill-diagram-tissue" />
			</Part>

			<Part
				title="Air spaces"
				note="Nose, mouth, throat and windpipe as one shape, painted over the head in the backdrop colour. Shown here in the air colour."
			>
				<path d={CAVITY_PATH} className="fill-diagram-air" />
			</Part>

			<Part title="Epiglottis" note="The flap behind the root of the tongue. Fixed.">
				<path d={EPIGLOTTIS_PATH} className="fill-diagram-tissue" />
			</Part>

			<Part
				title="Jaw, lower lip and chin"
				note="One outline that turns about a hinge near the ear (the dot). Solid: at rest. Lines: teeth shut, and wide open."
			>
				<g transform={rest.jaw}>
					<path d={rest.jawBody} className="fill-diagram-tissue" />
				</g>
				<Outline transform={jawShut.jaw} d={jawShut.jawBody} />
				<Outline transform={jawOpen.jaw} d={jawOpen.jawBody} />
				<circle cx={JAW_PIVOT[0]} cy={JAW_PIVOT[1]} r={6} className="fill-diagram-voice" />
			</Part>

			<Part
				title="Tongue"
				note={`Nine points joined by a smooth curve, fading into the flesh below. Solid: at rest. Lines: the ${tonguePoses.length} other shapes the test sounds use.`}
			>
				<path d={rest.tongue} className="fill-diagram-tongue" />
				{tonguePoses.map((pose) => (
					<Outline key={pose.tongue.join()} d={shapesFor(pose).tongue} />
				))}
			</Part>

			<Part
				title="Soft palate"
				note="Solid: raised, shutting off the nose. Line: lowered, letting air into it."
			>
				<path d={rest.velum} className="fill-diagram-tissue" />
				<Outline d={lowered.velum} />
			</Part>

			<Part
				title="Lips"
				note="The upper lip is its own shape; the lower one is part of the jaw. Solid: at rest. Lines: rounded, and pressed together."
			>
				<path d={rest.upperLip} className="fill-diagram-tissue" />
				<g transform={rest.jaw}>
					<path d={rest.jawBody} className="fill-diagram-tissue" clipPath="inset(0 76% 0 0)" />
				</g>
				<Outline d={rounded.upperLip} />
				<Outline transform={rounded.jaw} d={rounded.jawBody} clipPath="inset(0 76% 0 0)" />
				<Outline d={closed.upperLip} dashed />
				<Outline transform={closed.jaw} d={closed.jawBody} clipPath="inset(0 76% 0 0)" dashed />
			</Part>

			<Part title="Teeth" note="One top tooth, fixed, and one bottom tooth that rides on the jaw.">
				<path d={UPPER_TOOTH_PATH} className="fill-diagram-tooth" />
				<g transform={rest.jaw}>
					<path d={LOWER_TOOTH_PATH} className="fill-diagram-tooth" />
				</g>
			</Part>

			<Part
				title="Air paths"
				note="The lines the air dots travel: up the windpipe, then out through the mouth or the nose. The mouth path is redrawn for every pose, halfway between tongue and roof."
			>
				<Path points={TRUNK.points} />
				<Path points={oral} />
				<Path points={NASAL.points} dashed />
			</Part>

			<Part
				title="Vocal folds, from the side"
				note="A mark across the voice box: two stubs when the folds are apart, a rippling line when they buzz, a bar when they shut. Shown apart."
			>
				<path
					d={`M${FOLDS.front} ${FOLDS.y}H${FOLDS.front + 14}M${FOLDS.back - 14} ${FOLDS.y}H${FOLDS.back}`}
					strokeWidth={5}
					strokeLinecap="round"
					className="stroke-diagram-tooth"
				/>
				<circle
					cx={(FOLDS.front + FOLDS.back) / 2}
					cy={FOLDS.y}
					r={44}
					fill="none"
					strokeWidth={2.5}
					strokeDasharray="5 4"
					className="stroke-diagram-voice"
				/>
			</Part>

			<Part
				title="Vocal folds, from above"
				note="The circle below the chin. Left to right: apart (voice off), buzzing (voice on), shut (glottal stop)."
				ghost={false}
			>
				<FoldsFromAbove x={90} half={15.6} />
				<FoldsFromAbove x={250} half={2.4} voiced />
				<FoldsFromAbove x={410} half={0.6} voiced />
			</Part>
		</div>
	);
}

/** Each distinct tongue shape in the test sounds, other than the resting one. */
function uniqueTonguePoses(): Pose[] {
	const seen = new Set([REST.tongue]);
	const poses: Pose[] = [];
	for (const sound of MOUTH_SOUNDS) {
		for (const { pose } of sound.steps) {
			if (seen.has(pose.tongue)) continue;
			seen.add(pose.tongue);
			poses.push(pose);
		}
	}
	return poses;
}

function Part({
	title,
	note,
	ghost = true,
	children,
}: {
	title: string;
	note: string;
	ghost?: boolean;
	children: ReactNode;
}) {
	const rest = shapesFor(REST);
	return (
		<figure className="flex flex-col gap-2">
			<svg
				viewBox={VIEW_BOX}
				role="img"
				aria-label={title}
				className="aspect-square w-full rounded-2xl bg-diagram"
			>
				{ghost ? (
					<g opacity={0.16}>
						<path d={HEAD_PATH} className="fill-diagram-tissue" />
						<path d={CAVITY_PATH} className="fill-diagram" />
						<path d={EPIGLOTTIS_PATH} className="fill-diagram-tissue" />
						<g transform={rest.jaw}>
							<path d={rest.jawBody} className="fill-diagram-tissue" />
						</g>
						<path d={rest.tongue} className="fill-diagram-tissue" />
						<path d={rest.velum} className="fill-diagram-tissue" />
						<path d={rest.upperLip} className="fill-diagram-tissue" />
					</g>
				) : null}
				{children}
			</svg>
			<figcaption className="flex flex-col gap-0.5">
				<span className="text-sm font-semibold text-foreground">{title}</span>
				<span className="text-xs text-muted-foreground">{note}</span>
			</figcaption>
		</figure>
	);
}

/** Another position of a part, as a thin line. */
function Outline({
	d,
	transform,
	clipPath,
	dashed,
}: {
	d: string;
	transform?: string;
	clipPath?: string;
	dashed?: boolean;
}) {
	return (
		<g transform={transform}>
			<path
				d={d}
				clipPath={clipPath}
				fill="none"
				strokeWidth={1.8}
				strokeDasharray={dashed ? "5 4" : undefined}
				className="stroke-diagram-tooth"
			/>
		</g>
	);
}

function Path({ points, dashed }: { points: readonly Point[]; dashed?: boolean }) {
	return (
		<polyline
			points={points.map((point) => point.join(",")).join(" ")}
			fill="none"
			strokeWidth={3}
			strokeLinecap="round"
			strokeDasharray={dashed ? "2 7" : undefined}
			className="stroke-diagram-air"
		/>
	);
}

/** The folds as the diagram's circle draws them: a point at the front (top), opening toward the back. */
function FoldsFromAbove({ x, half, voiced }: { x: number; half: number; voiced?: boolean }) {
	const y = 250;
	const radius = 66;
	const top = y - 47;
	const bottom = y + 38;
	return (
		<g>
			<circle cx={x} cy={y} r={radius} className="fill-diagram-tissue" />
			<path
				d={`M${x} ${top}L${x + half} ${bottom}Q${x} ${bottom + 12} ${x - half} ${bottom}Z`}
				className="fill-diagram"
			/>
			<g strokeWidth={11} strokeLinecap="round" className="stroke-diagram-tooth">
				<line x1={x} y1={top} x2={x - half - 5} y2={bottom} />
				<line x1={x} y1={top} x2={x + half + 5} y2={bottom} />
			</g>
			<circle
				cx={x}
				cy={y}
				r={radius}
				fill="none"
				strokeWidth={4}
				className={voiced ? "stroke-diagram-voice" : "stroke-diagram-tissue"}
			/>
		</g>
	);
}
