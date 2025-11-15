import type { PhonemeArticulation, VowelArticulatoryFeatures } from "shared-data";
import { featureDefinitions } from "@/data/phoneme-details";

type StaticVowelFeatures = Extract<
	PhonemeArticulation,
	{ category: "vowel/monophthong" | "vowel/rhotic" }
>["features"];

type DiphthongVowelFeatures = Extract<
	PhonemeArticulation,
	{ category: "vowel/diphthong" }
>["features"];

export type VowelChartCategory = "vowel/monophthong" | "vowel/rhotic" | "vowel/diphthong";

export type VowelChartCardProps =
	| {
			category: "vowel/monophthong" | "vowel/rhotic";
			phonemeLabel: string;
			phonemeIpa: string;
			features: StaticVowelFeatures;
			chartId: string;
	  }
	| {
			category: "vowel/diphthong";
			phonemeLabel: string;
			phonemeIpa: string;
			features: DiphthongVowelFeatures;
			chartId: string;
	  };

export function VowelChartCard(props: VowelChartCardProps) {
	const isDiphthong = props.category === "vowel/diphthong";

	const startPoint = getVowelPoint(props.features.height, props.features.backness);
	const targetPoint = isDiphthong
		? getVowelPoint(props.features.targetHeight, props.features.targetBackness)
		: null;

	const startRoundness = props.features.roundness;
	const targetRoundness = isDiphthong ? props.features.targetRoundness : undefined;

	return (
		<section className="rounded-lg border bg-card p-4">
			<div className="aspect-square w-full">
				<VowelQuadrilateral
					chartId={props.chartId}
					label={props.phonemeLabel}
					ipa={props.phonemeIpa}
					start={startPoint}
					target={targetPoint}
					roundness={{ start: startRoundness, target: targetRoundness }}
				/>
			</div>
		</section>
	);
}

const VOWEL_CHART_VIEWBOX = { width: 160, height: 120 };

const vowelHeightOrder: VowelArticulatoryFeatures["height"][] = [
	"close",
	"near-close",
	"close-mid",
	"mid",
	"open-mid",
	"near-open",
	"open",
] as const;

type VowelHeight = VowelArticulatoryFeatures["height"];
type VowelBackness = VowelArticulatoryFeatures["backness"];
type VowelRoundness = VowelArticulatoryFeatures["roundness"];

const heightIndex: Record<VowelHeight, number> = {
	close: 0,
	"near-close": 1,
	"close-mid": 2,
	mid: 3,
	"open-mid": 4,
	"near-open": 5,
	open: 6,
};

const CHART_TOP = 12;
const CHART_BOTTOM = 110;
const CHART_LEFT = 32;
const CHART_RIGHT = 150;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;

const VOWEL_HEIGHT_POSITIONS = vowelHeightOrder.reduce<Record<VowelHeight, number>>(
	(acc, height) => {
		const index = heightIndex[height];
		acc[height] = CHART_TOP + (index / (vowelHeightOrder.length - 1)) * CHART_HEIGHT;
		return acc;
	},
	{} as Record<VowelHeight, number>,
);

const FRONT_TOP_X = CHART_LEFT;
const FRONT_BOTTOM_X = CHART_LEFT + 32;
const BACK_X = CHART_RIGHT;

const backnessRatios: Record<VowelBackness, number> = {
	front: 0,
	"near-front": 0.18,
	central: 0.5,
	"near-back": 0.82,
	back: 1,
};

const PRIMARY_MARKER_COLOR = "hsl(var(--primary))";
const PRIMARY_MARKER_SOFT = "hsl(var(--primary) / 0.5)";
const GRID_LINE_COLOR = "hsl(var(--border) / 0.6)";
const OUTLINE_COLOR = "hsl(var(--border))";
const LABEL_COLOR = "hsl(var(--muted-foreground))";
const LABEL_FONT_SIZE = 5.2;
const IPA_LABEL_COLOR = "hsl(var(--primary-foreground))";
const IPA_LABEL_BG = "hsl(var(--primary))";
const IPA_LABEL_FONT_SIZE = 7;
const IPA_LABEL_PADDING_X = 4;
const IPA_LABEL_PADDING_Y = 2;
const IPA_LABEL_OFFSET_X = 10;

type ChartPoint = { x: number; y: number };

function getVowelPoint(height: VowelHeight, backness: VowelBackness): ChartPoint {
	return {
		x: getBacknessPosition(backness, height),
		y: VOWEL_HEIGHT_POSITIONS[height],
	};
}

function getBacknessPosition(backness: VowelBackness, height: VowelHeight) {
	const left = getLeftBoundaryX(height);
	const span = BACK_X - left;
	return left + span * backnessRatios[backness];
}

function getLeftBoundaryX(height: VowelHeight) {
	const normalizedIndex = heightIndex[height] / (vowelHeightOrder.length - 1);
	return FRONT_TOP_X + (FRONT_BOTTOM_X - FRONT_TOP_X) * normalizedIndex;
}

type VowelQuadrilateralProps = {
	chartId: string;
	label: string;
	ipa: string;
	start: ChartPoint;
	target: ChartPoint | null;
	roundness: { start: VowelRoundness; target?: VowelRoundness };
};

function VowelQuadrilateral({
	chartId,
	label,
	ipa,
	start,
	target,
	roundness,
}: VowelQuadrilateralProps) {
	const arrowId = `vowel-arrow-${chartId}`;
	const topHeight = vowelHeightOrder[0];
	const bottomHeight = vowelHeightOrder[vowelHeightOrder.length - 1];

	return (
		<svg
			viewBox={`0 0 ${VOWEL_CHART_VIEWBOX.width} ${VOWEL_CHART_VIEWBOX.height}`}
			role="img"
			aria-label={`${label} vowel placement`}
			className="w-full"
		>
			<defs>
				<marker
					id={arrowId}
					viewBox="0 0 10 10"
					refX="5"
					refY="5"
					markerWidth="5"
					markerHeight="5"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill={PRIMARY_MARKER_SOFT} />
				</marker>
			</defs>

			<polygon
				points={[
					`${getLeftBoundaryX(topHeight)},${VOWEL_HEIGHT_POSITIONS[topHeight]}`,
					`${getLeftBoundaryX(bottomHeight)},${VOWEL_HEIGHT_POSITIONS[bottomHeight]}`,
					`${BACK_X},${VOWEL_HEIGHT_POSITIONS[bottomHeight]}`,
					`${BACK_X},${VOWEL_HEIGHT_POSITIONS[topHeight]}`,
				].join(" ")}
				fill="hsl(var(--muted) / 0.3)"
				stroke={OUTLINE_COLOR}
				strokeWidth={1.5}
			/>

			<MinimalGrid />

			<ChartMarker point={start} rounded={roundness.start} variant="start" label={ipa} />

			{target ? (
				<>
					<path
						d={`M ${start.x} ${start.y} L ${target.x} ${target.y}`}
						stroke={PRIMARY_MARKER_SOFT}
						strokeWidth={2}
						fill="none"
						markerEnd={`url(#${arrowId})`}
					/>
					<ChartMarker
						point={target}
						rounded={roundness.target ?? roundness.start}
						variant="target"
					/>
				</>
			) : null}
		</svg>
	);
}

type TextLabelProps = {
	x: number;
	y: number;
	text: string;
	align?: "start" | "middle" | "end";
};

function TextLabel({ x, y, text, align = "start" }: TextLabelProps) {
	return (
		<text
			x={x}
			y={y}
			fill={LABEL_COLOR}
			fontSize={LABEL_FONT_SIZE}
			textAnchor={align === "start" ? "start" : align === "end" ? "end" : "middle"}
		>
			{text}
		</text>
	);
}

function AxisLabels() {
	const topHeight = vowelHeightOrder[0];
	const topY = VOWEL_HEIGHT_POSITIONS[topHeight];
	const rowLabelOffset = 8;
	const closeY = VOWEL_HEIGHT_POSITIONS.close;
	const closeMidY = VOWEL_HEIGHT_POSITIONS["close-mid"];
	const openMidY = VOWEL_HEIGHT_POSITIONS["open-mid"];
	const openY = VOWEL_HEIGHT_POSITIONS.open;

	return (
		<>
			<TextLabel
				x={getBacknessPosition("front", topHeight)}
				y={topY - 6}
				text={featureDefinitions.backness.values.front.label}
				align="start"
			/>
			<TextLabel
				x={getBacknessPosition("central", topHeight)}
				y={topY - 6}
				text={featureDefinitions.backness.values.central.label}
				align="middle"
			/>
			<TextLabel
				x={getBacknessPosition("back", topHeight)}
				y={topY - 6}
				text={featureDefinitions.backness.values.back.label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("close") - rowLabelOffset}
				y={closeY - 1}
				text={featureDefinitions.height.values.close.label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("close-mid") - rowLabelOffset}
				y={closeMidY - 1}
				text={featureDefinitions.height.values["close-mid"].label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("open-mid") - rowLabelOffset}
				y={openMidY - 1}
				text={featureDefinitions.height.values["open-mid"].label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("open") - rowLabelOffset}
				y={openY - 1}
				text={featureDefinitions.height.values.open.label}
				align="end"
			/>
		</>
	);
}

function ColumnPath({ points }: { points: ChartPoint[] }) {
	if (points.length === 0) return null;
	const d = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

	return <path d={d} stroke={GRID_LINE_COLOR} strokeWidth={0.6} fill="none" />;
}

function MinimalGrid() {
	const closeMidY = VOWEL_HEIGHT_POSITIONS["close-mid"];
	const openMidY = VOWEL_HEIGHT_POSITIONS["open-mid"];
	const topHeight = vowelHeightOrder[0];
	const bottomHeight = vowelHeightOrder[vowelHeightOrder.length - 1];

	return (
		<>
			<ColumnPath
				points={[
					{ x: getBacknessPosition("front", topHeight), y: VOWEL_HEIGHT_POSITIONS[topHeight] },
					{
						x: getBacknessPosition("front", bottomHeight),
						y: VOWEL_HEIGHT_POSITIONS[bottomHeight],
					},
				]}
			/>

			<line
				x1={getBacknessPosition("central", topHeight)}
				x2={getBacknessPosition("central", bottomHeight)}
				y1={VOWEL_HEIGHT_POSITIONS[topHeight]}
				y2={VOWEL_HEIGHT_POSITIONS[bottomHeight]}
				stroke={GRID_LINE_COLOR}
				strokeWidth={0.6}
			/>
			<line
				x1={getBacknessPosition("front", "close-mid")}
				x2={BACK_X}
				y1={closeMidY}
				y2={closeMidY}
				stroke={GRID_LINE_COLOR}
				strokeWidth={0.6}
			/>
			<line
				x1={getBacknessPosition("front", "open-mid")}
				x2={BACK_X}
				y1={openMidY}
				y2={openMidY}
				stroke={GRID_LINE_COLOR}
				strokeWidth={0.6}
			/>
			<AxisLabels />
		</>
	);
}

type ChartMarkerProps = {
	point: ChartPoint;
	rounded: VowelRoundness;
	variant: "start" | "target";
	label?: string;
};

function ChartMarker({ point, rounded, variant, label }: ChartMarkerProps) {
	const radius = variant === "start" ? 4 : 3;
	const fillColor =
		rounded === "rounded"
			? variant === "start"
				? PRIMARY_MARKER_COLOR
				: PRIMARY_MARKER_SOFT
			: "hsl(var(--primary) / 0.1)";

	const strokeColor = variant === "start" ? PRIMARY_MARKER_COLOR : PRIMARY_MARKER_SOFT;
	const labelWidth = label ? measureApproximateLabel(label) : 0;
	const totalWidth = labelWidth + IPA_LABEL_PADDING_X * 2;
	const shouldFlip = point.x + IPA_LABEL_OFFSET_X + totalWidth > BACK_X;
	const rectX = shouldFlip
		? point.x - IPA_LABEL_OFFSET_X - totalWidth
		: point.x + IPA_LABEL_OFFSET_X;
	const rectY = point.y - (IPA_LABEL_FONT_SIZE + IPA_LABEL_PADDING_Y * 2) / 2;

	return (
		<>
			<circle
				cx={point.x}
				cy={point.y}
				r={radius}
				fill={fillColor}
				stroke={strokeColor}
				strokeWidth={rounded === "rounded" ? 1.2 : 1.5}
			/>
			{label ? (
				<>
					<rect
						x={rectX}
						y={rectY}
						width={totalWidth}
						height={IPA_LABEL_FONT_SIZE + IPA_LABEL_PADDING_Y * 2}
						fill={IPA_LABEL_BG}
						rx={4}
						opacity={0.95}
					/>
					<text
						x={rectX + totalWidth / 2}
						y={point.y}
						fill={IPA_LABEL_COLOR}
						fontSize={IPA_LABEL_FONT_SIZE}
						fontWeight={600}
						textAnchor="middle"
						dominantBaseline="middle"
					>
						{label}
					</text>
				</>
			) : null}
		</>
	);
}

function measureApproximateLabel(label: string) {
	return label.length * (IPA_LABEL_FONT_SIZE * 0.7);
}
