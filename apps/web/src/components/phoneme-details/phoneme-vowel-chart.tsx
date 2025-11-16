import type { PhonemeArticulation, VowelArticulatoryFeatures } from "shared-data";
import { featureDefinitions } from "@/data/phoneme-details";
import { cn } from "@/lib/utils";

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
		<section className="rounded-lg border bg-background-soft p-2">
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

const VOWEL_CHART_VIEWBOX = { width: 160, height: 160 };

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

const CHART_TOP = 32;
const CHART_BOTTOM = 130;
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

const LABEL_FONT_SIZE = 6;
const IPA_LABEL_FONT_SIZE = 8;
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
					<path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
				</marker>
			</defs>

			<polygon
				points={[
					`${getLeftBoundaryX(topHeight)},${VOWEL_HEIGHT_POSITIONS[topHeight]}`,
					`${getLeftBoundaryX(bottomHeight)},${VOWEL_HEIGHT_POSITIONS[bottomHeight]}`,
					`${BACK_X},${VOWEL_HEIGHT_POSITIONS[bottomHeight]}`,
					`${BACK_X},${VOWEL_HEIGHT_POSITIONS[topHeight]}`,
				].join(" ")}
				className="fill-muted/20 stroke-border"
				strokeWidth={1.5}
			/>

			<MinimalGrid />

			<ChartMarker point={start} rounded={roundness.start} variant="start" label={ipa} />

			{target ? (
				<>
					<DiphthongArrow start={start} target={target} arrowId={arrowId} />
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

type DiphthongArrowProps = {
	start: ChartPoint;
	target: ChartPoint;
	arrowId: string;
};

function DiphthongArrow({ start, target, arrowId }: DiphthongArrowProps) {
	// Calculate the direction vector from start to target
	const dx = target.x - start.x;
	const dy = target.y - start.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Normalize the direction vector
	const unitX = dx / distance;
	const unitY = dy / distance;

	// Shorten the line by the radius of the target circle (4) plus a small gap (2)
	const gap = 8;
	const endX = target.x - unitX * gap;
	const endY = target.y - unitY * gap;

	return (
		<path
			d={`M ${start.x} ${start.y} L ${endX} ${endY}`}
			className="stroke-primary"
			strokeWidth={2}
			fill="none"
			markerEnd={`url(#${arrowId})`}
		/>
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
			className="fill-muted-foreground"
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

	return <path d={d} className="stroke-border/60" strokeWidth={0.6} fill="none" />;
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
				className="stroke-border/60"
				strokeWidth={0.6}
			/>
			<line
				x1={getBacknessPosition("front", "close-mid")}
				x2={BACK_X}
				y1={closeMidY}
				y2={closeMidY}
				className="stroke-border/60"
				strokeWidth={0.6}
			/>
			<line
				x1={getBacknessPosition("front", "open-mid")}
				x2={BACK_X}
				y1={openMidY}
				y2={openMidY}
				className="stroke-border/60"
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
	const isRounded = rounded === "rounded";
	const isStart = variant === "start";

	const labelWidth = label ? measureApproximateLabel(label) : 0;
	const totalWidth = labelWidth + IPA_LABEL_PADDING_X * 2;
	const shouldFlip = point.x + IPA_LABEL_OFFSET_X + totalWidth > BACK_X;
	const rectX = shouldFlip
		? point.x - IPA_LABEL_OFFSET_X - totalWidth
		: point.x + IPA_LABEL_OFFSET_X;
	const rectY = point.y - (IPA_LABEL_FONT_SIZE + IPA_LABEL_PADDING_Y * 2) / 2;

	// Determine fill and stroke classes
	const fillClass = isRounded ? (isStart ? "fill-primary" : "fill-primary/50") : "fill-primary/10";
	const strokeClass = isStart ? "stroke-primary" : "stroke-primary/50";

	return (
		<>
			<circle
				cx={point.x}
				cy={point.y}
				r={4}
				className={cn(fillClass, strokeClass)}
				strokeWidth={isRounded ? 1.2 : 1.5}
			/>
			{label ? (
				<>
					<rect
						x={rectX}
						y={rectY}
						width={totalWidth}
						height={IPA_LABEL_FONT_SIZE + IPA_LABEL_PADDING_Y * 2}
						className="fill-primary"
						rx={4}
						opacity={0.95}
					/>
					<text
						x={rectX + totalWidth / 2}
						y={point.y}
						className="fill-primary-foreground"
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
