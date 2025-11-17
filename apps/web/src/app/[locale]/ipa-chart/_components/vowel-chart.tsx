"use client";

import type { CSSProperties } from "react";
import type { VowelArticulatoryFeatures } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { featureDefinitions } from "@/data/phoneme-details";
import { cn } from "@/lib/utils";
import {
	type ChartPoint,
	getBacknessPosition,
	getHeightPosition,
	getLeftBoundaryX,
	getVowelPoint,
	LARGE_VOWEL_CHART_LAYOUT,
	VOWEL_BACKNESS_ORDER,
	VOWEL_HEIGHT_ORDER,
} from "@/lib/vowel-chart-geometry";
import { useScopedI18n } from "@/locales/client";
import type { DiphthongVowelChartEntry, VowelChartEntry } from "../_lib/vowel-chart-data";
import { useIpaChartStore } from "../_store/ipa-chart-store";

type VowelChartProps = {
	entries: VowelChartEntry[];
};

type ChartMarkerData = {
	entry: VowelChartEntry;
	start: ChartPoint;
	target?: ChartPoint;
};

const layout = LARGE_VOWEL_CHART_LAYOUT;
const aspectRatio = `${layout.viewBoxWidth} / ${layout.viewBoxHeight}`;

export function VowelChart({ entries }: VowelChartProps) {
	const markers: ChartMarkerData[] = entries.map((entry) => ({
		entry,
		start: getVowelPoint(entry.features.height, entry.features.backness, layout),
		target:
			entry.category === "vowel/diphthong"
				? getVowelPoint(entry.features.targetHeight, entry.features.targetBackness, layout)
				: undefined,
	}));

	const diphthongs = markers.filter(
		(marker): marker is ChartMarkerData & { entry: DiphthongVowelChartEntry; target: ChartPoint } =>
			marker.entry.category === "vowel/diphthong" && Boolean(marker.target),
	);

	return (
		<div className="relative w-full" style={{ aspectRatio }}>
			<svg
				viewBox={`0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}`}
				className="h-full w-full"
				aria-hidden
			>
				<title>Vowel chart grid</title>
				<defs>
					<marker
						id="vowel-arrow-head"
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
				<VowelGrid />
				{diphthongs.map((marker) => (
					<DiphthongPath key={marker.entry.id} start={marker.start} target={marker.target} />
				))}
			</svg>
			<div className="absolute inset-0">
				{markers.map((marker) => (
					<VowelMarker key={marker.entry.id} marker={marker} />
				))}
				{diphthongs.map((marker) => (
					<DiphthongTarget
						key={`${marker.entry.id}-target`}
						point={marker.target}
						rounded={marker.entry.features.targetRoundness}
					/>
				))}
			</div>
		</div>
	);
}

function VowelGrid() {
	const topHeight = VOWEL_HEIGHT_ORDER[0];
	const bottomHeight = VOWEL_HEIGHT_ORDER[VOWEL_HEIGHT_ORDER.length - 1];

	return (
		<>
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
			{VOWEL_BACKNESS_ORDER.map((backness) => (
				<BacknessColumn key={backness} backness={backness} />
			))}
			{VOWEL_HEIGHT_ORDER.map((height) => (
				<line
					key={height}
					x1={getBacknessPosition("front", height, layout)}
					x2={layout.backX}
					y1={getHeightPosition(height, layout)}
					y2={getHeightPosition(height, layout)}
					className={cn(
						"stroke-border/60",
						height === "close" || height === "open" ? "stroke-2" : "stroke-[1px]",
					)}
					strokeDasharray={height.includes("near") ? "4 4" : undefined}
				/>
			))}
			<AxisLabels />
		</>
	);
}

function BacknessColumn({ backness }: { backness: VowelArticulatoryFeatures["backness"] }) {
	const points = VOWEL_HEIGHT_ORDER.map((height) => ({
		x: getBacknessPosition(backness, height, layout),
		y: getHeightPosition(height, layout),
	}));

	const d = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

	return (
		<path
			d={d}
			className={cn(
				"stroke-border/60",
				backness === "front" || backness === "back" ? "stroke-2" : "stroke-[1px]",
			)}
			fill="none"
			strokeDasharray={backness === "near-front" || backness === "near-back" ? "4 4" : undefined}
		/>
	);
}

function AxisLabels() {
	const tBackness = featureDefinitions.backness;
	const tHeight = featureDefinitions.height;
	const topLabelY = layout.chartTop - 10;
	const rowLabelOffset = 14;

	return (
		<>
			{VOWEL_BACKNESS_ORDER.map((backness, index) => (
				<text
					key={backness}
					x={getBacknessPosition(backness, VOWEL_HEIGHT_ORDER[0], layout)}
					y={topLabelY}
					className="fill-muted-foreground uppercase text-[9px] sm:text-[6px] odd:hidden sm:odd:block"
					fontWeight={600}
					textAnchor={
						index === 0 ? "start" : index === VOWEL_BACKNESS_ORDER.length - 1 ? "end" : "middle"
					}
				>
					{tBackness.values[backness].label}
				</text>
			))}
			{VOWEL_HEIGHT_ORDER.map((height) => (
				<text
					key={height}
					x={getLeftBoundaryX(height, layout) - rowLabelOffset}
					y={getHeightPosition(height, layout) + 3}
					className="fill-muted-foreground uppercase text-[9px] sm:text-[6px]"
					fontWeight={600}
					textAnchor="end"
				>
					{tHeight.values[height].label}
				</text>
			))}
		</>
	);
}

const markerSize = 44;

type VowelMarkerProps = {
	marker: ChartMarkerData;
};

function VowelMarker({ marker }: VowelMarkerProps) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const handleSelect = () => selectPhoneme(marker.entry.id);
	const leftPercent = (marker.start.x / layout.viewBoxWidth) * 100;
	const topPercent = (marker.start.y / layout.viewBoxHeight) * 100;
	const ariaLabel = `${marker.entry.label} (${marker.entry.ipa})`;
	const styles: CSSProperties = {
		left: `calc(${leftPercent}% - ${markerSize / 2}px)`,
		top: `calc(${topPercent}% - ${markerSize / 2}px)`,
	};

	const isRounded =
		marker.entry.category === "vowel/diphthong"
			? marker.entry.features.roundness === "rounded"
			: marker.entry.features.roundness === "rounded";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleSelect}
					className={cn(
						"absolute grid place-items-center border text-sm sm:text-lg font-semibold",
						"transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ",
						isRounded
							? "border-primary text-foreground rounded-full w-8 h-8 sm:w-10 sm:h-10"
							: "bg-primary text-primary-foreground rounded-sm w-8 h-8 sm:w-9 sm:h-9",
					)}
					style={styles}
					aria-label={ariaLabel}
				>
					{marker.entry.ipa}
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" align="center">
				<div className="max-w-[16rem] text-pretty text-xs leading-snug font-semibold">
					{marker.entry.label}
				</div>
			</TooltipContent>
		</Tooltip>
	);
}

type DiphthongPathProps = {
	start: ChartPoint;
	target: ChartPoint;
};

function DiphthongPath({ start, target }: DiphthongPathProps) {
	const dx = target.x - start.x;
	const dy = target.y - start.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	const unitX = dx / distance;
	const unitY = dy / distance;
	const gap = 14;
	const endX = target.x - unitX * gap;
	const endY = target.y - unitY * gap;

	return (
		<line
			x1={start.x}
			y1={start.y}
			x2={endX}
			y2={endY}
			className="stroke-primary/80"
			strokeWidth={2}
			markerEnd="url(#vowel-arrow-head)"
		/>
	);
}

type DiphthongTargetProps = {
	point: ChartPoint;
	rounded: VowelArticulatoryFeatures["roundness"];
};

function DiphthongTarget({ point, rounded }: DiphthongTargetProps) {
	const leftPercent = (point.x / layout.viewBoxWidth) * 100;
	const topPercent = (point.y / layout.viewBoxHeight) * 100;
	const styles: CSSProperties = {
		left: `calc(${leftPercent}% - 14px)`,
		top: `calc(${topPercent}% - 14px)`,
		width: 28,
		height: 28,
	};

	return (
		<div
			className={cn(
				"absolute rounded-full border-2",
				rounded === "rounded" ? "border-primary bg-primary/40" : "border-primary/50",
			)}
			style={styles}
			aria-hidden
		/>
	);
}

export function VowelChartLegend() {
	const t = useScopedI18n("ipa-chart.sections.vowels.legend");

	return (
		<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
			<div className="flex items-center gap-1">
				<span className="size-3 rounded-xs bg-primary" />
				<span>{t("unrounded")}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="size-3 rounded-full border border-primary/50" />
				<span>{t("rounded")}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="h-0.5 w-6 bg-primary" />
				<span>{t("diphthong")}</span>
			</div>
		</div>
	);
}
