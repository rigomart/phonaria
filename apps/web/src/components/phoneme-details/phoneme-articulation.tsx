import { EllipsisVerticalIcon } from "lucide-react";
import Image from "next/image";
import {
	allPhonemeSymbols,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	phonemeArticulations,
	type VowelArticulatoryFeatures,
} from "shared-data";
import {
	type ArticulatoryFeature,
	featureDefinitions,
	phonemeDetailsById,
} from "@/data/phoneme-details";
import { useScopedI18n } from "@/locales/client";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Pressable } from "../ui/pressable";
import { Separator } from "../ui/separator";
import { usePhonemeDetailsContext } from "./phoneme-details-context";
import {
	PhonemeSection,
	PhonemeSectionContent,
	PhonemeSectionDescription,
	PhonemeSectionHeader,
	PhonemeSectionTitle,
} from "./phoneme-section";

export function PhonemeDetailsArticulation() {
	const { phonemeId } = usePhonemeDetailsContext();

	const articulation = phonemeArticulations[phonemeId];

	const t = useScopedI18n(`components.phoneme-details.articulation`);

	return (
		<PhonemeSection>
			<PhonemeSectionHeader>
				<PhonemeSectionTitle>{t("title")}</PhonemeSectionTitle>
				<PhonemeSectionDescription>{t("description")}</PhonemeSectionDescription>
			</PhonemeSectionHeader>
			<PhonemeSectionContent>
				<div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div className="col-span-2">
						<ArticulationIllustration phonemeId={phonemeId} articulation={articulation} />
					</div>
					<div className="rounded-lg w-full col-span-1 space-y-3">
						<h4 className="text-base font-semibold">{t("features")}</h4>
						<ArticulatoryFeatures articulation={articulation} />
					</div>
				</div>
			</PhonemeSectionContent>

			{/* // TODO: Add steps and pitfalls after refining */}
		</PhonemeSection>
	);
}

type ArticulationIllustrationProps = {
	phonemeId: PhonemeSymbolId;
	articulation: PhonemeArticulation;
};

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

// TODO: Add the illustrations for the remaining categories
function ArticulationIllustration({ phonemeId, articulation }: ArticulationIllustrationProps) {
	const { label: phonemeLabel } = phonemeDetailsById[phonemeId];
	const { ipa: phonemeIpa } = allPhonemeSymbols[phonemeId];

	if (articulation.category === "consonant") {
		return (
			<AspectRatio ratio={1} className="bg-neutral-900/60 rounded-lg overflow-hidden">
				<Image
					src={`${BUCKET_URL}/diagrams/${phonemeId}.svg`}
					alt={`${phonemeLabel} articulation`}
					fill
					className="object-cover"
				/>
			</AspectRatio>
		);
	}

	if (articulation.category === "vowel/monophthong" || articulation.category === "vowel/rhotic") {
		return (
			<VowelChartCard
				chartId={phonemeId}
				phonemeLabel={phonemeLabel}
				phonemeIpa={phonemeIpa}
				category={articulation.category}
				features={articulation.features}
			/>
		);
	}

	if (articulation.category === "vowel/diphthong") {
		return (
			<VowelChartCard
				chartId={phonemeId}
				phonemeLabel={phonemeLabel}
				phonemeIpa={phonemeIpa}
				category={articulation.category}
				features={articulation.features}
			/>
		);
	}

	return null;
}

type ArticulatoryFeaturesProps = {
	articulation: PhonemeArticulation;
};

// TODO: Add the features for the remaining categories
function ArticulatoryFeatures({ articulation }: ArticulatoryFeaturesProps) {
	if (articulation.category === "consonant") {
		return (
			<div className="flex flex-wrap gap-2">
				<FeatureRow feature={featureDefinitions.manner} valueKey={articulation.features.manner} />
				<FeatureRow feature={featureDefinitions.place} valueKey={articulation.features.place} />
				<FeatureRow feature={featureDefinitions.voicing} valueKey={articulation.features.voicing} />
			</div>
		);
	}

	if (articulation.category === "vowel/monophthong" || articulation.category === "vowel/rhotic") {
		return (
			<div className="flex flex-wrap gap-2">
				<FeatureRow feature={featureDefinitions.height} valueKey={articulation.features.height} />
				<FeatureRow
					feature={featureDefinitions.backness}
					valueKey={articulation.features.backness}
				/>
				<FeatureRow
					feature={featureDefinitions.roundness}
					valueKey={articulation.features.roundness}
				/>
				<FeatureRow
					feature={featureDefinitions.tenseness}
					valueKey={articulation.features.tenseness}
				/>
			</div>
		);
	}

	return null;
}

function FeatureRow<ValueKey extends string>({
	feature,
	valueKey,
}: {
	feature: ArticulatoryFeature<ValueKey>;
	valueKey: ValueKey;
}) {
	const value = feature.values[valueKey];

	return (
		<div className="flex flex-col">
			<Popover>
				<PopoverTrigger asChild>
					<Pressable size="fit" variant="outline" className="flex rounded-full justify-start gap-2">
						<Badge
							className="text-xs font-semibold rounded-full"
							variant="secondary"
							title="Open details"
							aria-label="Open details"
						>
							{feature.label}:
						</Badge>
						<span className="text-sm text-muted-foreground">{value.label}</span>
						<EllipsisVerticalIcon className="size-3 mr-1" />
					</Pressable>
				</PopoverTrigger>
				<PopoverContent className="p-3" align="start">
					<dl className="space-y-3">
						<div className="space-y-1">
							<dt className="font-semibold text-sm">{feature.label}</dt>
							<dd className="text-sm text-muted-foreground">{feature.description}</dd>
						</div>

						<Separator />

						<div className="p-2 bg-primary/10 rounded-md border border-primary/10 space-y-1">
							<dt className="text-sm font-semibold">{value.label}</dt>
							<dd className="text-sm text-muted-foreground">{value.description}</dd>
						</div>
					</dl>
				</PopoverContent>
			</Popover>
		</div>
	);
}

type StaticVowelFeatures = Extract<
	PhonemeArticulation,
	{ category: "vowel/monophthong" | "vowel/rhotic" }
>["features"];

type DiphthongVowelFeatures = Extract<
	PhonemeArticulation,
	{ category: "vowel/diphthong" }
>["features"];

type VowelChartCardProps =
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

function VowelChartCard(props: VowelChartCardProps) {
	const isDiphthong = props.category === "vowel/diphthong";

	const startPoint = getVowelPoint(props.features.height, props.features.backness);
	const targetPoint = isDiphthong
		? getVowelPoint(props.features.targetHeight, props.features.targetBackness)
		: null;

	const startRoundness = props.features.roundness;
	const targetRoundness = isDiphthong ? props.features.targetRoundness : undefined;

	return (
		<section className="rounded-lg border border-white/5 bg-neutral-950/80 p-4">
			<VowelQuadrilateral
				chartId={props.chartId}
				label={props.phonemeLabel}
				ipa={props.phonemeIpa}
				start={startPoint}
				target={targetPoint}
				roundness={{ start: startRoundness, target: targetRoundness }}
			/>
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

const PRIMARY_MARKER_COLOR = "#0ea5e9";
const PRIMARY_MARKER_SOFT = "rgba(14,165,233,0.5)";
const GRID_LINE_COLOR = "rgba(255,255,255,0.2)";
const OUTLINE_COLOR = "rgba(255,255,255,0.7)";
const LABEL_COLOR = "rgba(255,255,255,0.6)";
const LABEL_FONT_SIZE = 4.4;
const IPA_LABEL_COLOR = "rgba(17,24,39,0.95)";
const IPA_LABEL_BG = "rgba(248,250,252,0.95)";
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
				fill="rgba(255,255,255,0.03)"
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
			: "rgba(14,165,233,0.1)";

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
