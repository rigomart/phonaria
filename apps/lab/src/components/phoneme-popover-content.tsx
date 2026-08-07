"use client";

import {
	type DiphthongVowelArticulation,
	getIpaForPhonemeId,
	getPhonemeArticulationRegistryForLanguage,
	getPhonemeType,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	type VowelArticulatoryFeatures,
} from "@phonaria/phonetics-data";
import {
	ToggleGroup,
	ToggleGroupItem,
	ToggleGroupSeparator,
} from "@phonaria/ui/components/toggle-group";
import { ChevronDown, MoveRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AudioControls } from "@/components/audio-controls";
import { phonemeLabels } from "@/lib/phoneme-labels";
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

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;
const TARGET_ACCENT = "en-us" as const;

const articulationRegistry = getPhonemeArticulationRegistryForLanguage(TARGET_ACCENT);

interface PhonemePopoverProps {
	phonemeId: PhonemeSymbolId;
}

export function PhonemePopoverContent({ phonemeId }: PhonemePopoverProps) {
	const ipa = getIpaForPhonemeId(phonemeId);
	const label = phonemeLabels[phonemeId];
	const phonemeType = getPhonemeType(phonemeId);
	const isDiphthong = phonemeType === "diphthong";
	const showAudio = phonemeType === "consonant" || phonemeType === "monophthong";
	const articulation = (articulationRegistry as Record<string, PhonemeArticulation>)[phonemeId];

	return (
		<div className="flex flex-col gap-2 w-72">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-baseline gap-0.5 text-2xl font-medium">
					<span className="text-muted-foreground/50">/</span>
					<span>{ipa}</span>
					<span className="text-muted-foreground/50">/</span>
				</div>
				{showAudio && <AudioControls path={`/audio/phonemes/${phonemeId}.ogg`} label={ipa} />}
			</div>

			{!isDiphthong && <p className="text-xs text-muted-foreground leading-snug">{label}</p>}

			{articulation && <ArticulationDiagram phonemeId={phonemeId} articulation={articulation} />}
		</div>
	);
}

function ArticulationDiagram({
	phonemeId,
	articulation,
}: {
	phonemeId: PhonemeSymbolId;
	articulation: PhonemeArticulation;
}) {
	const phonemeIpa = getIpaForPhonemeId(phonemeId);

	if (articulation.category === "consonant") {
		if (articulation.features.manner === "affricate") {
			return <AffricateConsonantDiagram phonemeId={phonemeId} />;
		}

		return (
			<div className="relative aspect-square w-full rounded-md bg-neutral-900/60 overflow-hidden">
				<Image
					src={`${BUCKET_URL}/diagrams/${TARGET_ACCENT}/${phonemeId}.svg`}
					alt={`${phonemeLabels[phonemeId]} articulation`}
					fill
					unoptimized
					className="object-cover"
				/>
			</div>
		);
	}

	if (articulation.vowelType === "monophthong") {
		return <MonophthongChart ipa={phonemeIpa} features={articulation.features} />;
	}

	if (articulation.vowelType === "diphthong") {
		return <DiphthongGlide phonemeId={phonemeId} articulation={articulation} />;
	}

	return null;
}

// --- Affricate (stop + fricative phases) ---

type AffricatePhase = "stop" | "fricative";

function AffricateConsonantDiagram({ phonemeId }: { phonemeId: PhonemeSymbolId }) {
	const [phase, setPhase] = useState<AffricatePhase>("stop");
	const label = phonemeLabels[phonemeId];
	const stopLabel = "Stop";
	const fricativeLabel = "Fricative";

	return (
		<div className="flex flex-col gap-2">
			<div className="relative aspect-square w-full rounded-md bg-neutral-900/60 overflow-hidden">
				<Image
					src={`${BUCKET_URL}/diagrams/${TARGET_ACCENT}/${phonemeId}_stop.svg`}
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
					src={`${BUCKET_URL}/diagrams/${TARGET_ACCENT}/${phonemeId}_fricative.svg`}
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
				className="self-start rounded-lg bg-background-strong"
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
				<ToggleGroupSeparator orientation="vertical" />
				<ToggleGroupItem value="fricative" aria-label={fricativeLabel}>
					{fricativeLabel}
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}

// --- Diphthong Glide ---

type GlidePosition = "start" | "target";

function DiphthongGlide({
	phonemeId,
	articulation,
}: {
	phonemeId: PhonemeSymbolId;
	articulation: DiphthongVowelArticulation;
}) {
	const [expanded, setExpanded] = useState<GlidePosition | null>(null);
	const { features } = articulation;

	const fullIpa = getIpaForPhonemeId(phonemeId);
	const startIpa = fullIpa.charAt(0);
	const targetIpa = fullIpa.slice(-1);

	return (
		<div className="flex flex-col gap-2.5">
			<div className="flex items-center gap-1.5">
				<GlidePositionButton
					ipa={startIpa}
					roundness={features.roundness}
					active={expanded === "start"}
					onClick={() => setExpanded(expanded === "start" ? null : "start")}
				/>
				<MoveRight className="size-3 shrink-0 text-muted-foreground" />
				<GlidePositionButton
					ipa={targetIpa}
					roundness={features.targetRoundness}
					active={expanded === "target"}
					onClick={() => setExpanded(expanded === "target" ? null : "target")}
				/>
			</div>

			<div
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
					expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="overflow-hidden">
					{expanded === "start" && (
						<MonophthongChart
							ipa={getIpaForPhonemeId(phonemeId).charAt(0)}
							features={{
								height: features.height,
								backness: features.backness,
								roundness: features.roundness,
							}}
						/>
					)}
					{expanded === "target" && (
						<MonophthongChart
							ipa={getIpaForPhonemeId(phonemeId).slice(-1)}
							features={{
								height: features.targetHeight,
								backness: features.targetBackness,
								roundness: features.targetRoundness,
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function GlidePositionButton({
	ipa,
	roundness,
	active,
	onClick,
}: {
	ipa: string;
	roundness: VowelArticulatoryFeatures["roundness"];
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"group flex-1 flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-150 cursor-pointer motion-reduce:transition-none",
				active
					? "border-primary bg-primary/10 text-foreground shadow-sm"
					: "border-border hover:border-primary/50 hover:bg-muted/50",
			)}
		>
			<span className="text-lg font-medium leading-none">{ipa}</span>
			<span className="text-[10px] text-muted-foreground leading-tight">{roundness}</span>
			<ChevronDown
				className={cn(
					"size-3 shrink-0 ml-auto text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
					active && "rotate-180 text-primary",
				)}
			/>
		</button>
	);
}

// --- Monophthong / single-position chart ---

type MonophthongChartProps = {
	ipa: string;
	features: {
		height: VowelArticulatoryFeatures["height"];
		backness: VowelArticulatoryFeatures["backness"];
		roundness: VowelArticulatoryFeatures["roundness"];
		rhoticity?: VowelArticulatoryFeatures["rhoticity"];
	};
};

function MonophthongChart({ ipa, features }: MonophthongChartProps) {
	const point = getVowelPoint(features.height, features.backness, SMALL_VOWEL_CHART_LAYOUT);
	const isRhotic = features.rhoticity === "r-colored";

	return <VowelChart ipa={ipa} point={point} roundness={features.roundness} isRhotic={isRhotic} />;
}

// --- Vowel Chart (single point) ---

type VowelChartProps = {
	ipa: string;
	point: ChartPoint;
	roundness: VowelArticulatoryFeatures["roundness"];
	isRhotic: boolean;
};

const IPA_LABEL_FONT_SIZE = 8;
const IPA_LABEL_PADDING_X = 4;
const IPA_LABEL_PADDING_Y = 2;
const IPA_LABEL_OFFSET_X = 10;

function VowelChart({ ipa, point, roundness, isRhotic }: VowelChartProps) {
	const layout = SMALL_VOWEL_CHART_LAYOUT;
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];

	return (
		<div className="rounded-md border bg-muted/30 p-1.5">
			<svg
				viewBox={`0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}`}
				role="img"
				aria-label={`${ipa} vowel placement`}
				className="w-full"
			>
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

				<ChartMarker point={point} rounded={roundness} label={ipa} isRhotic={isRhotic} />
			</svg>
		</div>
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

function VowelGrid() {
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
					<text
						x={getBacknessPosition(value, topHeight, layout)}
						y={topLabelY}
						className="fill-muted-foreground uppercase text-[5px]"
						fontWeight={600}
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
						className="stroke-border/60 stroke-[1.2px]"
					/>
					<text
						x={getLeftBoundaryX(value, layout) - 4}
						y={getHeightPosition(value, layout) + 1.5}
						className="fill-muted-foreground uppercase text-[5px]"
						fontWeight={600}
						textAnchor="end"
					>
						{label}
					</text>
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
}: {
	point: ChartPoint;
	rounded: VowelArticulatoryFeatures["roundness"];
	label?: string;
	isRhotic?: boolean;
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
				r={4}
				className={`${fillClass} ${strokeClass}`}
				strokeWidth={strokeWidth}
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
