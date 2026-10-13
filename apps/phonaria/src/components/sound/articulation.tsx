"use client";

import {
	getIpaForPhonemeId,
	type LanguagePhonemeId,
	type PhonemeArticulation,
	type TargetAccent,
	type VowelArticulatoryFeatures,
} from "@phonaria/phonetics-data";
import { ToggleGroup, ToggleGroupItem } from "@phonaria/ui/components/toggle-group";
import { useId, useState } from "react";
import { Image } from "@/components/image";
import { getPublicAssetBaseUrl } from "@/lib/site";
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

const BUCKET_URL = getPublicAssetBaseUrl();

type ArticulationProps = {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	label: string;
	articulation: PhonemeArticulation;
};

/** Full-size diagram: mouth image for consonants, vowel chart placement for vowels. */
export function ArticulationDiagram({
	phonemeId,
	targetAccent,
	label,
	articulation,
}: ArticulationProps) {
	if (articulation.category === "consonant") {
		if (articulation.features.manner === "affricate") {
			return (
				<AffricateConsonantDiagram
					targetAccent={targetAccent}
					phonemeId={phonemeId}
					label={label}
				/>
			);
		}

		return (
			<div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-900/60">
				<Image
					src={`${BUCKET_URL}/diagrams/${targetAccent}/${phonemeId}.svg`}
					alt={`${label} articulation`}
					fill
					unoptimized
					className="object-cover"
				/>
			</div>
		);
	}

	const isDiphthong = articulation.vowelType === "diphthong";
	return (
		<VowelChart
			marks={getVowelMarks(articulation, getIpaForPhonemeId(phonemeId), true)}
			ariaLabel={`${label} placement`}
			glide={isDiphthong}
		/>
	);
}

/**
 * Small, static version of the diagram for the short popover. Affricates show
 * their stop phase; diphthongs show the glide from start to target.
 */
export function ArticulationThumbnail({
	phonemeId,
	targetAccent,
	label,
	articulation,
}: ArticulationProps) {
	if (articulation.category === "consonant") {
		const isAffricate = articulation.features.manner === "affricate";
		return (
			<div className="relative size-32 shrink-0 overflow-hidden rounded-md bg-neutral-900/60">
				<Image
					src={`${BUCKET_URL}/diagrams/${targetAccent}/${phonemeId}${isAffricate ? "_stop" : ""}.svg`}
					alt={`${label} articulation`}
					fill
					unoptimized
					className="object-cover"
				/>
			</div>
		);
	}

	return (
		<div className="size-32 shrink-0">
			<VowelChart
				marks={getVowelMarks(articulation, getIpaForPhonemeId(phonemeId), false)}
				ariaLabel={`${label} placement`}
				compact
				glide={articulation.vowelType === "diphthong"}
			/>
		</div>
	);
}

/** Chart marks for a vowel: one point, or a diphthong's start and target. */
function getVowelMarks(
	articulation: Exclude<PhonemeArticulation, { category: "consonant" }>,
	ipa: string,
	labeled: boolean,
): VowelChartMark[] {
	const { features } = articulation;
	const start: VowelChartMark = {
		point: getVowelPoint(features.height, features.backness, SMALL_VOWEL_CHART_LAYOUT),
		roundness: features.roundness,
		isRhotic: "rhoticity" in features && features.rhoticity === "r-colored",
	};
	if (articulation.vowelType === "monophthong") {
		return [{ ...start, label: labeled ? ipa : undefined }];
	}
	const target: VowelChartMark = {
		point: getVowelPoint(
			articulation.features.targetHeight,
			articulation.features.targetBackness,
			SMALL_VOWEL_CHART_LAYOUT,
		),
		roundness: articulation.features.targetRoundness,
		isRhotic: false,
	};
	return [
		{ ...start, label: labeled ? ipa.charAt(0) : undefined },
		{ ...target, label: labeled ? ipa.slice(-1) : undefined },
	];
}

// --- Affricate (stop + fricative phases) ---

type AffricatePhase = "stop" | "fricative";

function AffricateConsonantDiagram({
	targetAccent,
	phonemeId,
	label,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	label: string;
}) {
	const [phase, setPhase] = useState<AffricatePhase>("stop");
	const stopLabel = "Stop";
	const fricativeLabel = "Fricative";

	return (
		<div className="flex flex-col gap-2">
			<div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-900/60">
				<Image
					src={`${BUCKET_URL}/diagrams/${targetAccent}/${phonemeId}_stop.svg`}
					alt={`${label} (${stopLabel})`}
					fill
					unoptimized
					className={cn(
						"absolute inset-0 object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none",
						phase === "stop" ? "opacity-100" : "opacity-0",
					)}
					aria-hidden={phase !== "stop"}
				/>
				<Image
					src={`${BUCKET_URL}/diagrams/${targetAccent}/${phonemeId}_fricative.svg`}
					alt={`${label} (${fricativeLabel})`}
					fill
					unoptimized
					className={cn(
						"absolute inset-0 object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none",
						phase === "fricative" ? "opacity-100" : "opacity-0",
					)}
					aria-hidden={phase !== "fricative"}
				/>
			</div>

			<ToggleGroup
				aria-label="Affricate phase"
				className="self-start"
				spacing={0}
				value={[phase]}
				onValueChange={(nextPhase) => {
					const [nextValue] = nextPhase;
					if (!nextValue) return;
					setPhase(nextValue as AffricatePhase);
				}}
				variant="outline"
				size="sm"
			>
				<ToggleGroupItem value="stop" aria-label={stopLabel}>
					{stopLabel}
				</ToggleGroupItem>
				<ToggleGroupItem value="fricative" aria-label={fricativeLabel}>
					{fricativeLabel}
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}

// --- Vowel Chart (one point, or a glide between two) ---

type VowelChartMark = {
	point: ChartPoint;
	roundness: VowelArticulatoryFeatures["roundness"];
	isRhotic: boolean;
	label?: string;
};

type VowelChartProps = {
	marks: VowelChartMark[];
	ariaLabel: string;
	/** Drops the axis labels, which are unreadable at thumbnail size. */
	compact?: boolean;
	/** Draws an arrow from the first mark to the second. */
	glide?: boolean;
};

const IPA_LABEL_FONT_SIZE = 8;
const IPA_LABEL_PADDING_X = 4;
const IPA_LABEL_PADDING_Y = 2;
const IPA_LABEL_OFFSET_X = 10;
const MARKER_RADIUS = 4;

function VowelChart({ marks, ariaLabel, compact = false, glide = false }: VowelChartProps) {
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];
	const arrowId = `vowel-glide-arrow-${useId().replaceAll(":", "")}`;
	const [start, target] = marks;

	return (
		<div className={cn("rounded-2xl border bg-muted/30", compact ? "p-0.5" : "p-1.5")}>
			<svg
				viewBox={`0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}`}
				role="img"
				aria-label={ariaLabel}
				className="w-full"
			>
				{glide && (
					<defs>
						<marker
							id={arrowId}
							viewBox="0 0 10 10"
							refX="8"
							refY="5"
							markerWidth="5"
							markerHeight="5"
							orient="auto-start-reverse"
						>
							<path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
						</marker>
					</defs>
				)}

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

				<VowelGrid showLabels={!compact} />

				{glide && start && target && (
					<GlideLine from={start.point} to={target.point} markerId={arrowId} />
				)}

				{marks.map((mark) => (
					<ChartMarker
						key={`${mark.point.x},${mark.point.y}`}
						point={mark.point}
						rounded={mark.roundness}
						label={mark.label}
						isRhotic={mark.isRhotic}
						scale={compact ? 1.6 : 1}
					/>
				))}
			</svg>
		</div>
	);
}

function GlideLine({ from, to, markerId }: { from: ChartPoint; to: ChartPoint; markerId: string }) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const length = Math.hypot(dx, dy) || 1;
	// Stop short of both markers so the arrowhead stays visible.
	const inset = MARKER_RADIUS * 1.6 + 2;
	return (
		<line
			x1={from.x + (dx / length) * inset}
			y1={from.y + (dy / length) * inset}
			x2={to.x - (dx / length) * inset}
			y2={to.y - (dy / length) * inset}
			className="stroke-primary"
			strokeWidth={2.4}
			markerEnd={`url(#${markerId})`}
		/>
	);
}

// --- Shared SVG helpers ---

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

function VowelGrid({ showLabels }: { showLabels: boolean }) {
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];
	const topLabelY = layout.chartTop - 6;

	return (
		<>
			{BACKNESS_LABELS.map(({ value, label }, i) => (
				<g key={value}>
					<line
						x1={getBacknessPosition(value, topHeight, layout)}
						x2={getBacknessPosition(value, bottomHeight, layout)}
						y1={getHeightPosition(topHeight, layout)}
						y2={getHeightPosition(bottomHeight, layout)}
						className="stroke-border/60 stroke-[1.2px]"
						fill="none"
					/>
					{showLabels && (
						<text
							x={getBacknessPosition(value, topHeight, layout)}
							y={topLabelY}
							className="fill-muted-foreground uppercase text-[5px]"
							fontWeight={600}
							textAnchor={i === 0 ? "start" : i === BACKNESS_LABELS.length - 1 ? "end" : "middle"}
						>
							{label}
						</text>
					)}
				</g>
			))}
			{HEIGHT_LABELS.map(({ value, label }) => (
				<g key={value}>
					<line
						x1={getBacknessPosition("front", value, layout)}
						x2={layout.backX}
						y1={getHeightPosition(value, layout)}
						y2={getHeightPosition(value, layout)}
						className="stroke-border/60 stroke-[1.2px]"
					/>
					{showLabels && (
						<text
							x={getLeftBoundaryX(value, layout) - 4}
							y={getHeightPosition(value, layout) + 1.5}
							className="fill-muted-foreground uppercase text-[5px]"
							fontWeight={600}
							textAnchor="end"
						>
							{label}
						</text>
					)}
				</g>
			))}
		</>
	);
}

function ChartMarker({
	point,
	rounded,
	label,
	isRhotic = false,
	scale = 1,
}: {
	point: ChartPoint;
	rounded: VowelArticulatoryFeatures["roundness"];
	label?: string;
	isRhotic?: boolean;
	scale?: number;
}) {
	const isRounded = rounded === "rounded";

	const labelWidth = label ? label.length * (IPA_LABEL_FONT_SIZE * 0.7) : 0;
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
				r={MARKER_RADIUS * scale}
				className={`${fillClass} ${strokeClass}`}
				strokeWidth={strokeWidth * scale}
				strokeDasharray={strokeDasharray}
			/>
			{label && (
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
			)}
		</>
	);
}
