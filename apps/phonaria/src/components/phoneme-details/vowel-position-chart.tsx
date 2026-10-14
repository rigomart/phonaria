import type { VowelArticulatoryFeatures } from "@phonaria/phonetics-data";
import { cn } from "@/lib/utils";
import {
	getBacknessPosition,
	getHeightPosition,
	getLeftBoundaryX,
	getVowelPoint,
	SMALL_VOWEL_CHART_LAYOUT,
	VOWEL_HEIGHT_ORDER,
} from "@/lib/vowel-chart-geometry";

export type VowelPosition = {
	height: VowelArticulatoryFeatures["height"];
	backness: VowelArticulatoryFeatures["backness"];
	roundness: VowelArticulatoryFeatures["roundness"];
	rhoticity?: VowelArticulatoryFeatures["rhoticity"];
};

const layout = SMALL_VOWEL_CHART_LAYOUT;
const TOP_HEIGHT = VOWEL_HEIGHT_ORDER[0];
const BOTTOM_HEIGHT = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];
/** Trims the empty bands the shared layout leaves around the trapezoid and its labels. */
const VIEW_TOP = layout.chartTop - 16;
const VIEW_BOTTOM = layout.chartBottom + 8;

/*
 * Sizes are in viewBox units. The chart is never drawn narrower than about
 * 300px (twice the 160-unit viewBox), so 6.5 units renders at 13px or more.
 */
const AXIS_FONT_SIZE = 6.5;
const MARKER_FONT_SIZE = 9;
const MARKER_PADDING_X = 4;
const MARKER_PADDING_Y = 2;
const MARKER_OFFSET_X = 10;
const LINE_WIDTH = 1.2;

const BACKNESS_LABELS: { value: VowelArticulatoryFeatures["backness"]; label: string }[] = [
	{ value: "front", label: "Front" },
	{ value: "central", label: "Central" },
	{ value: "back", label: "Back" },
];

const HEIGHT_LABELS: { value: VowelArticulatoryFeatures["height"]; label: string }[] = [
	{ value: "close", label: "Close" },
	{ value: "close-mid", label: "Cl-mid" },
	{ value: "open-mid", label: "Op-mid" },
	{ value: "open", label: "Open" },
];

/** Where the tongue sits for one vowel, on the vowel trapezoid. */
export function VowelPositionChart({ ipa, features }: { ipa: string; features: VowelPosition }) {
	const point = getVowelPoint(features.height, features.backness, layout);

	return (
		<div className="rounded-2xl bg-background p-3">
			<svg
				viewBox={`0 ${VIEW_TOP} ${layout.viewBoxWidth} ${VIEW_BOTTOM - VIEW_TOP}`}
				role="img"
				aria-label={`${ipa} vowel placement`}
				className="w-full"
			>
				<polygon
					points={[
						`${getLeftBoundaryX(TOP_HEIGHT, layout)},${getHeightPosition(TOP_HEIGHT, layout)}`,
						`${getLeftBoundaryX(BOTTOM_HEIGHT, layout)},${getHeightPosition(BOTTOM_HEIGHT, layout)}`,
						`${layout.backX},${getHeightPosition(BOTTOM_HEIGHT, layout)}`,
						`${layout.backX},${getHeightPosition(TOP_HEIGHT, layout)}`,
					].join(" ")}
					className="fill-background-strong stroke-border"
					strokeWidth={LINE_WIDTH}
				/>
				<VowelGrid />
				<VowelMarker
					x={point.x}
					y={point.y}
					label={ipa}
					rounded={features.roundness === "rounded"}
					rhotic={features.rhoticity === "r-colored"}
				/>
			</svg>
		</div>
	);
}

function VowelGrid() {
	return (
		<g className="fill-muted-foreground stroke-border" fontSize={AXIS_FONT_SIZE} fontWeight={600}>
			{BACKNESS_LABELS.map(({ value, label }, i) => (
				<g key={value}>
					<line
						x1={getBacknessPosition(value, TOP_HEIGHT, layout)}
						x2={getBacknessPosition(value, BOTTOM_HEIGHT, layout)}
						y1={getHeightPosition(TOP_HEIGHT, layout)}
						y2={getHeightPosition(BOTTOM_HEIGHT, layout)}
						strokeWidth={LINE_WIDTH}
					/>
					<text
						x={getBacknessPosition(value, TOP_HEIGHT, layout)}
						y={layout.chartTop - 6}
						stroke="none"
						textAnchor={i === 0 ? "start" : i === BACKNESS_LABELS.length - 1 ? "end" : "middle"}
					>
						{label}
					</text>
				</g>
			))}
			{HEIGHT_LABELS.map(({ value, label }) => (
				<g key={value}>
					<line
						x1={getBacknessPosition("front", value, layout)}
						x2={layout.backX}
						y1={getHeightPosition(value, layout)}
						y2={getHeightPosition(value, layout)}
						strokeWidth={LINE_WIDTH}
					/>
					<text
						x={getLeftBoundaryX(value, layout) - 4}
						y={getHeightPosition(value, layout) + 2}
						stroke="none"
						textAnchor="end"
					>
						{label}
					</text>
				</g>
			))}
		</g>
	);
}

function VowelMarker({
	x,
	y,
	label,
	rounded,
	rhotic,
}: {
	x: number;
	y: number;
	label: string;
	rounded: boolean;
	rhotic: boolean;
}) {
	const width = label.length * MARKER_FONT_SIZE * 0.7 + MARKER_PADDING_X * 2;
	const height = MARKER_FONT_SIZE + MARKER_PADDING_Y * 2;
	const flip = x + MARKER_OFFSET_X + width > layout.backX;
	const rectX = flip ? x - MARKER_OFFSET_X - width : x + MARKER_OFFSET_X;

	return (
		<>
			<circle
				cx={x}
				cy={y}
				r={4}
				className={cn(
					rhotic && "fill-secondary stroke-primary",
					!rhotic && rounded && "fill-primary",
					!rhotic && !rounded && "fill-none stroke-primary",
				)}
				strokeWidth={rounded && !rhotic ? 0 : 1.5}
				strokeDasharray={rhotic ? "2 2" : undefined}
			/>
			<rect
				x={rectX}
				y={y - height / 2}
				width={width}
				height={height}
				rx={4}
				className="fill-primary"
			/>
			<text
				x={rectX + width / 2}
				y={y}
				className="fill-primary-foreground"
				fontSize={MARKER_FONT_SIZE}
				fontWeight={600}
				textAnchor="middle"
				dominantBaseline="central"
			>
				{label}
			</text>
		</>
	);
}
