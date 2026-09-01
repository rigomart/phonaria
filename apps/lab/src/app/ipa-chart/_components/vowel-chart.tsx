"use client";

import type { PhonemeSymbolId, TargetAccent } from "@phonaria/phonetics-data";
import { Label } from "@phonaria/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { ScrollArea } from "@phonaria/ui/components/scroll-area";
import { Switch } from "@phonaria/ui/components/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { type CSSProperties, useId, useState } from "react";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import { type ChartPoint, getVowelPoint } from "@/lib/vowel-chart-geometry";
import type {
	StaticDiphthongVowelChartEntry,
	StaticMonophthongVowelChartEntry,
	StaticVowelChartEntry,
} from "../_lib/vowel-chart-data";
import {
	getMarkerPercentPosition,
	VowelChartSurface,
	vowelChartLayout,
	vowelMarkerButtonBaseClass,
} from "./vowel-chart-surface";

type VowelChartProps = {
	targetAccent: TargetAccent;
	entries: StaticVowelChartEntry[];
};

type VowelMarkerData = {
	entry: StaticVowelChartEntry;
	start: ChartPoint;
	offset: MarkerOffset;
};

type MonophthongMarkerData = VowelMarkerData & {
	entry: StaticMonophthongVowelChartEntry;
};

type DiphthongMarkerData = VowelMarkerData & {
	entry: StaticDiphthongVowelChartEntry;
};

type DiphthongGlideData = {
	entry: StaticDiphthongVowelChartEntry;
	start: ChartPoint;
	target: ChartPoint;
	label: ChartPoint;
	path: string;
	startHasMonophthong: boolean;
	targetHasMonophthong: boolean;
};

type MarkerOffset = {
	x: number;
	y: number;
};

const BASE_MARKER_OFFSET: MarkerOffset = { x: 0, y: 0 };
const MARKER_OFFSET_RADIUS = 14;
const GLIDE_TARGET_GAP = 14;
const GLIDE_LABEL_OFFSET = 10;

const MARKER_OFFSET_OVERRIDES: Record<string, MarkerOffset[]> = {
	"open-front": [
		{ x: 4, y: -15 },
		{ x: 18, y: -2 },
	],
	"open-mid-back": [
		{ x: -14, y: 0 },
		{ x: 14, y: 0 },
		{ x: 0, y: -22 },
	],
};

const DIPHTHONG_BOWS = {
	EI: -16,
	OU: 18,
	AI: 22,
	AU: -44,
	OI: 22,
} as const satisfies Partial<Record<PhonemeSymbolId, number>>;

export function VowelChart({ targetAccent, entries }: VowelChartProps) {
	const [showDiphthongs, setShowDiphthongs] = useState(false);
	const reactId = useId();
	const arrowMarkerId = `vowel-diphthong-arrow-${reactId.replaceAll(":", "")}`;
	const statusId = `vowel-diphthong-status-${reactId.replaceAll(":", "")}`;
	const markers = getVowelMarkers(entries);
	const monophthongMarkers = markers.filter(
		(marker): marker is MonophthongMarkerData => marker.entry.vowelType === "monophthong",
	);
	const diphthongMarkers = markers.filter(
		(marker): marker is DiphthongMarkerData => marker.entry.vowelType === "diphthong",
	);
	const diphthongGlides = getDiphthongGlides(diphthongMarkers, monophthongMarkers);

	return (
		<div className="flex w-full flex-col gap-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<VowelChartLegend showGlide={diphthongGlides.length > 0} />
				{diphthongGlides.length > 0 && (
					<Label className="cursor-pointer rounded-md border bg-background-strong px-3 py-2">
						<span>Show diphthongs</span>
						<Switch
							checked={showDiphthongs}
							onCheckedChange={setShowDiphthongs}
							aria-describedby={statusId}
						/>
					</Label>
				)}
			</div>

			<ScrollArea className="w-full">
				<div className="flex justify-center">
					<div className="w-full max-w-2xl min-w-96 shrink-0">
						<VowelChartSurface
							arrowMarkerId={arrowMarkerId}
							svgOverlay={
								<DiphthongGlideLayer
									glides={diphthongGlides}
									arrowMarkerId={arrowMarkerId}
									visible={showDiphthongs}
								/>
							}
							overlay={
								<>
									{monophthongMarkers.map((marker) => (
										<VowelMarker
											key={marker.entry.id}
											targetAccent={targetAccent}
											marker={marker}
										/>
									))}
									{showDiphthongs &&
										diphthongGlides.map((glide) => (
											<DiphthongLabel
												key={glide.entry.id}
												targetAccent={targetAccent}
												glide={glide}
											/>
										))}
								</>
							}
						/>
					</div>
				</div>
			</ScrollArea>

			{diphthongGlides.length > 0 && (
				<p id={statusId} className="sr-only" aria-live="polite">
					{showDiphthongs
						? `Diphthong layer shown: ${diphthongGlides.length} glides over the monophthong chart.`
						: "Diphthong layer hidden."}
				</p>
			)}
		</div>
	);
}

function getVowelMarkers(entries: StaticVowelChartEntry[]): VowelMarkerData[] {
	const keyCounts = new Map<string, number>();
	for (const entry of entries) {
		const key = getMarkerGroupKey(entry);
		keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
	}

	const groupOffsets = new Map<string, MarkerOffset[]>();
	for (const [key, count] of keyCounts.entries()) {
		groupOffsets.set(key, MARKER_OFFSET_OVERRIDES[key] ?? getMarkerOffsets(count));
	}

	const groupUsageIndex = new Map<string, number>();
	return entries.map((entry) => {
		const key = getMarkerGroupKey(entry);
		const offsets = groupOffsets.get(key) ?? [BASE_MARKER_OFFSET];
		const index = groupUsageIndex.get(key) ?? 0;
		groupUsageIndex.set(key, index + 1);

		return {
			entry,
			start: getVowelPoint(entry.features.height, entry.features.backness, vowelChartLayout),
			offset: offsets[index] ?? BASE_MARKER_OFFSET,
		};
	});
}

function getDiphthongGlides(
	diphthongMarkers: DiphthongMarkerData[],
	monophthongMarkers: MonophthongMarkerData[],
): DiphthongGlideData[] {
	return diphthongMarkers.map((marker) => {
		const { features } = marker.entry;
		const startMonophthong = findMatchingMonophthong(monophthongMarkers, {
			height: features.height,
			backness: features.backness,
			roundness: features.roundness,
		});
		const targetMonophthong = findMatchingMonophthong(monophthongMarkers, {
			height: features.targetHeight,
			backness: features.targetBackness,
			roundness: features.targetRoundness,
		});
		const start = startMonophthong
			? getRenderedMarkerPoint(startMonophthong)
			: getRenderedMarkerPoint(marker);
		const target = targetMonophthong
			? getRenderedMarkerPoint(targetMonophthong)
			: getVowelPoint(features.targetHeight, features.targetBackness, vowelChartLayout);
		const bow = DIPHTHONG_BOWS[marker.entry.id as keyof typeof DIPHTHONG_BOWS] ?? 0;
		const geometry = getGlideGeometry(start, target, bow);

		return {
			entry: marker.entry,
			start,
			target,
			label: geometry.label,
			path: geometry.path,
			startHasMonophthong: Boolean(startMonophthong),
			targetHasMonophthong: Boolean(targetMonophthong),
		};
	});
}

function findMatchingMonophthong(
	markers: MonophthongMarkerData[],
	features: Pick<StaticMonophthongVowelChartEntry["features"], "height" | "backness" | "roundness">,
) {
	return markers.find(
		(marker) =>
			marker.entry.features.height === features.height &&
			marker.entry.features.backness === features.backness &&
			marker.entry.features.roundness === features.roundness,
	);
}

function getRenderedMarkerPoint(marker: VowelMarkerData) {
	return addPoints(marker.start, marker.offset);
}

function VowelMarker({
	targetAccent,
	marker,
}: {
	targetAccent: TargetAccent;
	marker: MonophthongMarkerData;
}) {
	const markerPoint = addPoints(marker.start, marker.offset);
	const { leftPercent, topPercent } = getMarkerPercentPosition(markerPoint, vowelChartLayout);
	const buttonStyles = {
		"--marker-left": `${leftPercent}%`,
		"--marker-top": `${topPercent}%`,
	};
	const ariaLabel = `${marker.entry.label} (${marker.entry.ipa})`;
	const isRounded = marker.entry.features.roundness === "rounded";
	const isRhotic = marker.entry.features.rhoticity === "r-colored";

	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger
					render={
						<PopoverTrigger
							render={
								<button
									type="button"
									className={cn(
										vowelMarkerButtonBaseClass,
										"left-[calc(var(--marker-left)-0.75rem)] top-[calc(var(--marker-top)-0.75rem)]",
										"sm:left-[calc(var(--marker-left)-1.125rem)] sm:top-[calc(var(--marker-top)-1.125rem)]",
										"hover:z-10 motion-reduce:transition-none",
										{
											"border-transparent bg-primary text-primary-foreground rounded-full size-6 sm:size-9 hover:bg-primary":
												isRounded && !isRhotic,
											"border-primary bg-background text-foreground rounded-full size-6 sm:size-9 hover:bg-background-strong":
												!isRounded && !isRhotic,
											"border-dashed border-primary bg-background-strong text-foreground rounded-full size-6 sm:size-9 hover:bg-background":
												isRhotic,
										},
									)}
									style={buttonStyles as CSSProperties}
									aria-label={ariaLabel}
								/>
							}
						>
							{marker.entry.ipa}
						</PopoverTrigger>
					}
				>
					{marker.entry.ipa}
				</TooltipTrigger>
				<TooltipContent side="top" align="center">
					<div className="max-w-xs text-pretty text-xs leading-snug font-semibold">
						{marker.entry.label}
					</div>
				</TooltipContent>
			</Tooltip>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent targetAccent={targetAccent} phonemeId={marker.entry.id} />
			</PopoverContent>
		</Popover>
	);
}

function DiphthongLabel({
	targetAccent,
	glide,
}: {
	targetAccent: TargetAccent;
	glide: DiphthongGlideData;
}) {
	const { leftPercent, topPercent } = getMarkerPercentPosition(glide.label, vowelChartLayout);
	const buttonStyles = {
		"--marker-left": `${leftPercent}%`,
		"--marker-top": `${topPercent}%`,
	};
	const ariaLabel = `${glide.entry.label} (${glide.entry.ipa})`;

	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger
					render={
						<PopoverTrigger
							render={
								<button
									type="button"
									data-diphthong={glide.entry.id}
									className="absolute left-(--marker-left) top-(--marker-top) -translate-x-1/2 -translate-y-1/2 rounded-sm px-1 font-display text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:text-lg"
									style={buttonStyles as CSSProperties}
									aria-label={ariaLabel}
								/>
							}
						>
							{glide.entry.ipa}
						</PopoverTrigger>
					}
				>
					{glide.entry.ipa}
				</TooltipTrigger>
				<TooltipContent side="top" align="center">
					<div className="max-w-xs text-pretty text-xs leading-snug font-semibold">
						{glide.entry.label}
					</div>
				</TooltipContent>
			</Tooltip>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent targetAccent={targetAccent} phonemeId={glide.entry.id} />
			</PopoverContent>
		</Popover>
	);
}

function DiphthongGlideLayer({
	glides,
	arrowMarkerId,
	visible,
}: {
	glides: DiphthongGlideData[];
	arrowMarkerId: string;
	visible: boolean;
}) {
	return (
		<g
			className={cn(
				"pointer-events-none transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
				visible ? "opacity-100" : "translate-y-1 opacity-0",
			)}
		>
			{glides.map((glide) => (
				<g key={glide.entry.id}>
					<path
						d={glide.path}
						className="stroke-primary"
						strokeOpacity={0.8}
						strokeWidth={2}
						fill="none"
						markerEnd={`url(#${arrowMarkerId})`}
					/>
					{!glide.startHasMonophthong && <HollowEndpoint point={glide.start} />}
					{!glide.targetHasMonophthong && <HollowEndpoint point={glide.target} />}
				</g>
			))}
		</g>
	);
}

function HollowEndpoint({ point }: { point: ChartPoint }) {
	return (
		<circle
			cx={point.x}
			cy={point.y}
			r={4.5}
			className="fill-background stroke-primary"
			strokeWidth={1.5}
		/>
	);
}

function getGlideGeometry(start: ChartPoint, target: ChartPoint, bow: number) {
	const control = getControlPoint(start, target, bow);
	const end = trimQuadraticEnd(start, control, target, GLIDE_TARGET_GAP);
	const midpoint = getQuadraticPoint(start, end.control, end.target, 0.5);
	const tangent = getQuadraticTangent(start, end.control, end.target, 0.5);
	const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
	const labelSide = Math.sign(bow) || 1;
	return {
		path: `M ${formatNumber(start.x)} ${formatNumber(start.y)} Q ${formatNumber(end.control.x)} ${formatNumber(end.control.y)} ${formatNumber(end.target.x)} ${formatNumber(end.target.y)}`,
		label: {
			x: midpoint.x + (-tangent.y / tangentLength) * GLIDE_LABEL_OFFSET * labelSide,
			y: midpoint.y + (tangent.x / tangentLength) * GLIDE_LABEL_OFFSET * labelSide,
		},
	};
}

function getControlPoint(start: ChartPoint, target: ChartPoint, bow: number): ChartPoint {
	const dx = target.x - start.x;
	const dy = target.y - start.y;
	const length = Math.hypot(dx, dy) || 1;
	return {
		x: (start.x + target.x) / 2 + (-dy / length) * bow,
		y: (start.y + target.y) / 2 + (dx / length) * bow,
	};
}

function trimQuadraticEnd(start: ChartPoint, control: ChartPoint, target: ChartPoint, gap: number) {
	const sampleCount = 120;
	const points = Array.from({ length: sampleCount + 1 }, (_, index) =>
		getQuadraticPoint(start, control, target, index / sampleCount),
	);
	let remaining = 0;
	let cut = 1;

	for (let index = sampleCount; index > 0; index--) {
		remaining += Math.hypot(
			points[index].x - points[index - 1].x,
			points[index].y - points[index - 1].y,
		);
		if (remaining >= gap) {
			cut = (index - 1) / sampleCount;
			break;
		}
	}

	const safeCut = Math.max(cut, 0.02);
	return {
		control: {
			x: start.x + (control.x - start.x) * safeCut,
			y: start.y + (control.y - start.y) * safeCut,
		},
		target: getQuadraticPoint(start, control, target, safeCut),
	};
}

function getQuadraticPoint(
	start: ChartPoint,
	control: ChartPoint,
	target: ChartPoint,
	t: number,
): ChartPoint {
	const inverse = 1 - t;
	return {
		x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * target.x,
		y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * target.y,
	};
}

function getQuadraticTangent(
	start: ChartPoint,
	control: ChartPoint,
	target: ChartPoint,
	t: number,
): ChartPoint {
	return {
		x: 2 * (1 - t) * (control.x - start.x) + 2 * t * (target.x - control.x),
		y: 2 * (1 - t) * (control.y - start.y) + 2 * t * (target.y - control.y),
	};
}

function addPoints(point: ChartPoint, offset: MarkerOffset): ChartPoint {
	return { x: point.x + offset.x, y: point.y + offset.y };
}

function formatNumber(value: number) {
	return Math.round(value * 100) / 100;
}

function getMarkerGroupKey(entry: StaticVowelChartEntry) {
	return `${entry.features.height}-${entry.features.backness}`;
}

function getMarkerOffsets(count: number): MarkerOffset[] {
	if (count <= 1) return [BASE_MARKER_OFFSET];

	if (count === 2) {
		return [
			{ x: -MARKER_OFFSET_RADIUS, y: 0 },
			{ x: MARKER_OFFSET_RADIUS, y: 0 },
		];
	}

	if (count === 3) {
		return [
			{ x: -MARKER_OFFSET_RADIUS, y: 8 },
			{ x: MARKER_OFFSET_RADIUS, y: 8 },
			{ x: 0, y: -MARKER_OFFSET_RADIUS },
		];
	}

	const offsets: MarkerOffset[] = [];
	const angleOffset = -Math.PI / 2;
	for (let index = 0; index < count; index++) {
		const angle = angleOffset + (index * (2 * Math.PI)) / count;
		offsets.push({
			x: Math.cos(angle) * MARKER_OFFSET_RADIUS,
			y: Math.sin(angle) * MARKER_OFFSET_RADIUS,
		});
	}

	return offsets;
}

function VowelChartLegend({ showGlide }: { showGlide: boolean }) {
	return (
		<div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-2.5 sm:size-3 rounded-full border border-primary" />
				<span>Unrounded</span>
			</div>
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-2.5 sm:size-3 rounded-full bg-primary" />
				<span>Rounded</span>
			</div>
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-2.5 sm:size-3 rounded-full border border-dashed border-primary bg-background-strong" />
				<span>R-colored</span>
			</div>
			{showGlide && (
				<div className="flex items-center gap-1 sm:gap-1.5">
					<svg className="h-3 w-5 stroke-primary" viewBox="0 0 20 12" aria-hidden>
						<title>Glide</title>
						<path d="M 1 10 Q 9 1 17 5" fill="none" strokeWidth="1.5" />
						<path d="m 14 2 3 3-4 1" fill="none" strokeWidth="1.5" />
					</svg>
					<span>Glide</span>
				</div>
			)}
		</div>
	);
}
