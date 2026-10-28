import {
	getPhonemeArticulationRegistryForLanguage,
	type LanguagePhonemeId,
	type PhonemeArticulation,
	type TargetAccent,
	type VowelArticulatoryFeatures,
} from "@phonaria/phonetics-data";
import { Image } from "@/components/image";
import { getPublicAssetBaseUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
	getBacknessPosition,
	getHeightPosition,
	getLeftBoundaryX,
	getVowelPoint,
	SMALL_VOWEL_CHART_LAYOUT,
	VOWEL_HEIGHT_ORDER,
} from "@/lib/vowel-chart-geometry";

const BUCKET_URL = getPublicAssetBaseUrl();
const layout = SMALL_VOWEL_CHART_LAYOUT;
const TOP = VOWEL_HEIGHT_ORDER[0];
const BOTTOM = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];
/** The trapezoid plus room for a marker on its corners. */
const PAD = 14;
const VIEW_BOX = `${layout.frontTopX - PAD} ${layout.chartTop - PAD} ${layout.backX - layout.frontTopX + 2 * PAD} ${layout.chartBottom - layout.chartTop + 2 * PAD}`;
const GRID_BACKNESS: VowelArticulatoryFeatures["backness"][] = ["central"];
const GRID_HEIGHTS: VowelArticulatoryFeatures["height"][] = ["close-mid", "open-mid"];

/**
 * A small preview of how the sound is made, for the compact level: the mouth
 * diagram for consonants (an affricate's stop), and for vowels the chart's
 * outline with a dot or a glide arrow. Decorative, with no text: the full
 * view's "How it's made" carries the labels.
 */
export function ArticulationThumbnail({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const articulation = (
		getPhonemeArticulationRegistryForLanguage(targetAccent) as Record<
			LanguagePhonemeId<TargetAccent>,
			PhonemeArticulation
		>
	)[phonemeId];

	if (articulation.category === "consonant") {
		const affricate = articulation.features.manner === "affricate";
		const file = affricate ? `${phonemeId}_stop` : phonemeId;
		return (
			<div
				aria-hidden="true"
				className="relative aspect-square w-full overflow-hidden rounded-2xl bg-diagram"
			>
				<Image
					src={`${BUCKET_URL}/diagrams/${targetAccent}/${file}.svg`}
					alt=""
					fill
					unoptimized
					// The affricate artwork prints its phase name along the bottom; crop it out.
					className={cn("object-cover", affricate && "origin-top scale-110")}
				/>
			</div>
		);
	}

	const { features } = articulation;
	const start = getVowelPoint(features.height, features.backness, layout);
	const end =
		articulation.vowelType === "diphthong"
			? getVowelPoint(
					articulation.features.targetHeight,
					articulation.features.targetBackness,
					layout,
				)
			: null;

	return (
		<div aria-hidden="true" className="aspect-square w-full rounded-2xl bg-background p-2">
			<svg viewBox={VIEW_BOX} className="size-full">
				<VowelOutline />
				{end ? (
					<Glide from={start} to={end} />
				) : (
					<VowelDot x={start.x} y={start.y} roundness={features.roundness} />
				)}
			</svg>
		</div>
	);
}

function VowelOutline() {
	return (
		<>
			<VowelTrapezoid />
			{/* The chart's inner lines, faint and unlabelled, so the dot reads as a position. */}
			<g className="stroke-border" strokeWidth={1.5}>
				{GRID_BACKNESS.map((backness) => (
					<line
						key={backness}
						x1={getBacknessPosition(backness, TOP, layout)}
						x2={getBacknessPosition(backness, BOTTOM, layout)}
						y1={getHeightPosition(TOP, layout)}
						y2={getHeightPosition(BOTTOM, layout)}
					/>
				))}
				{GRID_HEIGHTS.map((height) => (
					<line
						key={height}
						x1={getLeftBoundaryX(height, layout)}
						x2={layout.backX}
						y1={getHeightPosition(height, layout)}
						y2={getHeightPosition(height, layout)}
					/>
				))}
			</g>
		</>
	);
}

function VowelTrapezoid() {
	return (
		<polygon
			points={[
				`${getLeftBoundaryX(TOP, layout)},${getHeightPosition(TOP, layout)}`,
				`${getLeftBoundaryX(BOTTOM, layout)},${getHeightPosition(BOTTOM, layout)}`,
				`${layout.backX},${getHeightPosition(BOTTOM, layout)}`,
				`${layout.backX},${getHeightPosition(TOP, layout)}`,
			].join(" ")}
			className="fill-background-strong stroke-border"
			strokeWidth={2}
		/>
	);
}

function VowelDot({
	x,
	y,
	roundness,
}: {
	x: number;
	y: number;
	roundness: VowelArticulatoryFeatures["roundness"];
}) {
	// Filled for rounded lips, a ring for spread ones, as on the vowel chart.
	return roundness === "rounded" ? (
		<circle cx={x} cy={y} r={9} className="fill-primary" />
	) : (
		<circle cx={x} cy={y} r={8} className="fill-background-strong stroke-primary" strokeWidth={3} />
	);
}

function Glide({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
	// Stop the line short of the end so the arrowhead lands on the target.
	const length = Math.hypot(to.x - from.x, to.y - from.y);
	const ux = (to.x - from.x) / length;
	const uy = (to.y - from.y) / length;
	const tip = { x: to.x - ux * 2, y: to.y - uy * 2 };
	const base = { x: tip.x - ux * 14, y: tip.y - uy * 14 };
	const wing = { x: -uy * 7, y: ux * 7 };
	return (
		<>
			<circle
				cx={from.x}
				cy={from.y}
				r={6}
				className="fill-background-strong stroke-primary"
				strokeWidth={3}
			/>
			<line
				x1={from.x}
				y1={from.y}
				x2={base.x}
				y2={base.y}
				className="stroke-primary"
				strokeWidth={4}
				strokeLinecap="round"
			/>
			<polygon
				points={`${tip.x},${tip.y} ${base.x + wing.x},${base.y + wing.y} ${base.x - wing.x},${base.y - wing.y}`}
				className="fill-primary"
			/>
		</>
	);
}
