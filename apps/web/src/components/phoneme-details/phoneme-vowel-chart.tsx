import type { PhonemeArticulation, VowelArticulatoryFeatures } from "shared-data";
import { featureDefinitions } from "@/data/phoneme-details";
import { cn } from "@/lib/utils";
import {
	type ChartPoint,
	getBacknessPosition,
	getHeightPosition,
	getLeftBoundaryX,
	getVowelPoint,
	SMALL_VOWEL_CHART_LAYOUT,
	VOWEL_HEIGHT_ORDER,
} from "@/lib/vowel-chart-geometry";

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
	const layout = SMALL_VOWEL_CHART_LAYOUT;

	const startPoint = getVowelPoint(props.features.height, props.features.backness, layout);
	const targetPoint = isDiphthong
		? getVowelPoint(props.features.targetHeight, props.features.targetBackness, layout)
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

type VowelRoundness = VowelArticulatoryFeatures["roundness"];

const LABEL_FONT_SIZE = 6;
const IPA_LABEL_FONT_SIZE = 8;
const IPA_LABEL_PADDING_X = 4;
const IPA_LABEL_PADDING_Y = 2;
const IPA_LABEL_OFFSET_X = 10;

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
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];
	const layout = SMALL_VOWEL_CHART_LAYOUT;

	return (
		<svg
			viewBox={`0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}`}
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
					`${getLeftBoundaryX(topHeight, layout)},${getHeightPosition(topHeight, layout)}`,
					`${getLeftBoundaryX(bottomHeight, layout)},${getHeightPosition(bottomHeight, layout)}`,
					`${layout.backX},${getHeightPosition(bottomHeight, layout)}`,
					`${layout.backX},${getHeightPosition(topHeight, layout)}`,
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
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const topY = getHeightPosition(topHeight, SMALL_VOWEL_CHART_LAYOUT);
	const rowLabelOffset = 8;
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const closeY = getHeightPosition("close", layout);
	const closeMidY = getHeightPosition("close-mid", layout);
	const openMidY = getHeightPosition("open-mid", layout);
	const openY = getHeightPosition("open", layout);

	return (
		<>
			<TextLabel
				x={getBacknessPosition("front", topHeight, layout)}
				y={topY - 6}
				text={featureDefinitions.backness.values.front.label}
				align="start"
			/>
			<TextLabel
				x={getBacknessPosition("central", topHeight, layout)}
				y={topY - 6}
				text={featureDefinitions.backness.values.central.label}
				align="middle"
			/>
			<TextLabel
				x={getBacknessPosition("back", topHeight, layout)}
				y={topY - 6}
				text={featureDefinitions.backness.values.back.label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("close", layout) - rowLabelOffset}
				y={closeY - 1}
				text={featureDefinitions.height.values.close.label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("close-mid", layout) - rowLabelOffset}
				y={closeMidY - 1}
				text={featureDefinitions.height.values["close-mid"].label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("open-mid", layout) - rowLabelOffset}
				y={openMidY - 1}
				text={featureDefinitions.height.values["open-mid"].label}
				align="end"
			/>
			<TextLabel
				x={getLeftBoundaryX("open", layout) - rowLabelOffset}
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
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const closeMidY = getHeightPosition("close-mid", layout);
	const openMidY = getHeightPosition("open-mid", layout);
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];

	return (
		<>
			<ColumnPath
				points={[
					{
						x: getBacknessPosition("front", topHeight, layout),
						y: getHeightPosition(topHeight, layout),
					},
					{
						x: getBacknessPosition("front", bottomHeight, layout),
						y: getHeightPosition(bottomHeight, layout),
					},
				]}
			/>

			<line
				x1={getBacknessPosition("central", topHeight, layout)}
				x2={getBacknessPosition("central", bottomHeight, layout)}
				y1={getHeightPosition(topHeight, layout)}
				y2={getHeightPosition(bottomHeight, layout)}
				className="stroke-border/60"
				strokeWidth={0.6}
			/>
			<line
				x1={getBacknessPosition("front", "close-mid", layout)}
				x2={layout.backX}
				y1={closeMidY}
				y2={closeMidY}
				className="stroke-border/60"
				strokeWidth={0.6}
			/>
			<line
				x1={getBacknessPosition("front", "open-mid", layout)}
				x2={layout.backX}
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
	const shouldFlip = point.x + IPA_LABEL_OFFSET_X + totalWidth > SMALL_VOWEL_CHART_LAYOUT.backX;
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
