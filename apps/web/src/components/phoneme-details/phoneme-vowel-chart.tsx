import type { PhonemeArticulation, VowelArticulatoryFeatures, VowelType } from "shared-data";
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
	{ vowelType: "monophthong" | "rhotic" }
>["features"];

type DiphthongVowelFeatures = Extract<PhonemeArticulation, { vowelType: "diphthong" }>["features"];

export type VowelChartCardProps =
	| {
			vowelType: "monophthong" | "rhotic";
			phonemeLabel: string;
			phonemeIpa: string;
			features: StaticVowelFeatures;
			chartId: string;
	  }
	| {
			vowelType: "diphthong";
			phonemeLabel: string;
			phonemeIpa: string;
			features: DiphthongVowelFeatures;
			chartId: string;
	  };

export function VowelChartCard(props: VowelChartCardProps) {
	const isDiphthong = props.vowelType === "diphthong";
	const layout = SMALL_VOWEL_CHART_LAYOUT;

	const startPoint = getVowelPoint(props.features.height, props.features.backness, layout);
	const targetPoint = isDiphthong
		? getVowelPoint(props.features.targetHeight, props.features.targetBackness, layout)
		: null;

	const startRoundness = props.features.roundness;
	const targetRoundness = isDiphthong ? props.features.targetRoundness : undefined;
	const isRhotic = props.vowelType === "rhotic";

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
					isRhotic={isRhotic}
				/>
			</div>
		</section>
	);
}

type VowelRoundness = VowelArticulatoryFeatures["roundness"];

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
	isRhotic: boolean;
};

function VowelQuadrilateral({
	chartId,
	label,
	ipa,
	start,
	target,
	roundness,
	isRhotic,
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
					<path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary/80" />
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
				strokeWidth={1.2}
			/>

			<VowelGrid />

			<ChartMarker
				point={start}
				rounded={roundness.start}
				variant="start"
				label={ipa}
				isRhotic={isRhotic}
			/>

			{target ? (
				<>
					<DiphthongArrow start={start} target={target} arrowId={arrowId} />
					<ChartMarker
						point={target}
						rounded={roundness.target ?? roundness.start}
						variant="target"
						isRhotic={false}
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
			className="stroke-primary/80"
			strokeWidth={2}
			fill="none"
			markerEnd={`url(#${arrowId})`}
		/>
	);
}

function AxisLabels() {
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const topLabelY = layout.chartTop - 6;
	const rowLabelOffset = 8;
	const tBackness = featureDefinitions.backness;
	const tHeight = featureDefinitions.height;
	const mainBackness = ["front", "central", "back"] as const satisfies ReadonlyArray<
		VowelArticulatoryFeatures["backness"]
	>;
	const mainHeights = ["close", "close-mid", "open-mid", "open"] as const satisfies ReadonlyArray<
		VowelArticulatoryFeatures["height"]
	>;

	return (
		<>
			{mainBackness.map((backness, index) => (
				<text
					key={backness}
					x={getBacknessPosition(backness, topHeight, layout)}
					y={topLabelY}
					className="fill-muted-foreground uppercase text-[6px]"
					fontWeight={600}
					textAnchor={index === 0 ? "start" : index === mainBackness.length - 1 ? "end" : "middle"}
				>
					{tBackness.values[backness].label}
				</text>
			))}
			{mainHeights.map((height) => (
				<text
					key={height}
					x={getLeftBoundaryX(height, layout) - rowLabelOffset}
					y={getHeightPosition(height, layout) + 2}
					className="fill-muted-foreground uppercase text-[6px]"
					fontWeight={600}
					textAnchor="end"
				>
					{tHeight.values[height].label}
				</text>
			))}
		</>
	);
}

function BacknessColumn({ backness }: { backness: VowelArticulatoryFeatures["backness"] }) {
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];

	return (
		<line
			x1={getBacknessPosition(backness, topHeight, layout)}
			x2={getBacknessPosition(backness, bottomHeight, layout)}
			y1={getHeightPosition(topHeight, layout)}
			y2={getHeightPosition(bottomHeight, layout)}
			className="stroke-border/60 stroke-[1.2px]"
			fill="none"
		/>
	);
}

function VowelGrid() {
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const mainBackness = ["front", "central", "back"] as const satisfies ReadonlyArray<
		VowelArticulatoryFeatures["backness"]
	>;
	const mainHeights = ["close", "close-mid", "open-mid", "open"] as const satisfies ReadonlyArray<
		VowelArticulatoryFeatures["height"]
	>;

	return (
		<>
			{mainBackness.map((backness) => (
				<BacknessColumn key={backness} backness={backness} />
			))}
			{mainHeights.map((height) => (
				<line
					key={height}
					x1={getBacknessPosition("front", height, layout)}
					x2={layout.backX}
					y1={getHeightPosition(height, layout)}
					y2={getHeightPosition(height, layout)}
					className="stroke-border/60 stroke-[1.2px]"
				/>
			))}
			<AxisLabels />
		</>
	);
}

type ChartMarkerProps = {
	point: ChartPoint;
	rounded: VowelRoundness;
	variant: "start" | "target";
	label?: string;
	isRhotic?: boolean;
};

function ChartMarker({
	point,
	rounded,
	variant: _variant,
	label,
	isRhotic = false,
}: ChartMarkerProps) {
	const isRounded = rounded === "rounded";

	const labelWidth = label ? measureApproximateLabel(label) : 0;
	const totalWidth = labelWidth + IPA_LABEL_PADDING_X * 2;
	const shouldFlip = point.x + IPA_LABEL_OFFSET_X + totalWidth > SMALL_VOWEL_CHART_LAYOUT.backX;
	const rectX = shouldFlip
		? point.x - IPA_LABEL_OFFSET_X - totalWidth
		: point.x + IPA_LABEL_OFFSET_X;
	const rectY = point.y - (IPA_LABEL_FONT_SIZE + IPA_LABEL_PADDING_Y * 2) / 2;

	let fillClass: string;
	let strokeClass: string;
	let strokeWidth: number;
	let strokeDasharray: string | undefined;

	if (isRhotic) {
		fillClass = "fill-primary/10";
		strokeClass = "stroke-primary";
		strokeWidth = 1.5;
		strokeDasharray = "2 2";
	} else if (isRounded) {
		fillClass = "fill-primary";
		strokeClass = "stroke-transparent";
		strokeWidth = 0;
		strokeDasharray = undefined;
	} else {
		fillClass = "fill-none";
		strokeClass = "stroke-primary";
		strokeWidth = 1.5;
		strokeDasharray = undefined;
	}

	return (
		<>
			<circle
				cx={point.x}
				cy={point.y}
				r={4}
				className={cn(fillClass, strokeClass)}
				strokeWidth={strokeWidth}
				strokeDasharray={strokeDasharray}
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
