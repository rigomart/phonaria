"use client";

import { type CSSProperties, useId } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type ChartPoint, getVowelPoint } from "@/lib/vowel-chart-geometry";
import type { DiphthongVowelChartEntry } from "../_lib/vowel-chart-data";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import {
	getMarkerPercentPosition,
	VowelChartSurface,
	vowelChartLayout,
	vowelMarkerButtonBaseClass,
} from "./vowel-chart-surface";

type DiphthongGeometry = {
	entry: DiphthongVowelChartEntry;
	start: ChartPoint;
	target: ChartPoint;
};

const diphthongArrowGap = 14;

export function DiphthongVowelChart({ entries }: { entries: DiphthongVowelChartEntry[] }) {
	const arrowMarkerId = useId();
	const geometries: DiphthongGeometry[] = entries.map((entry) => ({
		entry,
		start: getVowelPoint(entry.features.height, entry.features.backness, vowelChartLayout),
		target: getVowelPoint(
			entry.features.targetHeight,
			entry.features.targetBackness,
			vowelChartLayout,
		),
	}));

	return (
		<VowelChartSurface
			arrowMarkerId={arrowMarkerId}
			svgOverlay={geometries.map((geometry) => (
				<DiphthongPath
					key={geometry.entry.id}
					start={geometry.start}
					target={geometry.target}
					markerId={arrowMarkerId}
				/>
			))}
			overlay={geometries.map((geometry) => (
				<DiphthongMarker key={geometry.entry.id} geometry={geometry} />
			))}
		/>
	);
}

function DiphthongMarker({ geometry }: { geometry: DiphthongGeometry }) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const handleSelect = () => selectPhoneme(geometry.entry.id);
	const lineEnd = getShortenedLineEnd(geometry.start, geometry.target);
	const midPoint = {
		x: (geometry.start.x + lineEnd.x) / 2,
		y: (geometry.start.y + lineEnd.y) / 2,
	};
	const startPercents = getMarkerPercentPosition(geometry.start, vowelChartLayout);
	const midPercents = getMarkerPercentPosition(midPoint, vowelChartLayout);
	const targetPercents = getMarkerPercentPosition(geometry.target, vowelChartLayout);
	const ariaLabel = `${geometry.entry.label} (${geometry.entry.ipa})`;
	const startRounded = geometry.entry.features.roundness === "rounded";
	const targetRounded = geometry.entry.features.targetRoundness === "rounded";

	const startStyles = {
		"--marker-left": `${startPercents.leftPercent}%`,
		"--marker-top": `${startPercents.topPercent}%`,
	};
	const buttonStyles = {
		"--marker-left": `${midPercents.leftPercent}%`,
		"--marker-top": `${midPercents.topPercent}%`,
	};
	const targetStyles = {
		"--marker-left": `${targetPercents.leftPercent}%`,
		"--marker-top": `${targetPercents.topPercent}%`,
	};

	return (
		<>
			<div
				className={cn(
					"absolute shadow-sm rounded-full size-5 sm:size-6",
					"left-[calc(var(--marker-left)-0.625rem)] top-[calc(var(--marker-top)-0.625rem)]",
					"sm:left-[calc(var(--marker-left)-0.75rem)] sm:top-[calc(var(--marker-top)-0.75rem)]",
					{
						"bg-primary text-primary-foreground": startRounded,
						"border border-primary bg-background text-foreground": !startRounded,
					},
				)}
				style={startStyles as CSSProperties}
				aria-hidden
			/>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={handleSelect}
						className={cn(
							vowelMarkerButtonBaseClass,
							"border bg-secondary text-foreground rounded-full shadow-sm size-6 sm:size-9",
							"left-[calc(var(--marker-left)-0.75rem)] top-[calc(var(--marker-top)-0.75rem)]",
							"sm:left-[calc(var(--marker-left)-1.125rem)] sm:top-[calc(var(--marker-top)-1.125rem)]",
						)}
						style={buttonStyles as CSSProperties}
						aria-label={ariaLabel}
					>
						{geometry.entry.ipa}
					</button>
				</TooltipTrigger>
				<TooltipContent side="top" align="center">
					<div className="max-w-[16rem] text-pretty text-xs leading-snug font-semibold">
						{geometry.entry.label}
					</div>
				</TooltipContent>
			</Tooltip>
			<div
				className={cn(
					"absolute shadow-sm rounded-full size-5 sm:size-6",
					"left-[calc(var(--marker-left)-0.625rem)] top-[calc(var(--marker-top)-0.625rem)]",
					"sm:left-[calc(var(--marker-left)-0.75rem)] sm:top-[calc(var(--marker-top)-0.75rem)]",
					{
						"bg-primary text-primary-foreground": targetRounded,
						"border border-primary bg-background text-foreground": !targetRounded,
					},
				)}
				style={targetStyles as CSSProperties}
				aria-hidden
			/>
		</>
	);
}

function DiphthongPath({
	start,
	target,
	markerId,
}: {
	start: ChartPoint;
	target: ChartPoint;
	markerId: string;
}) {
	const end = getShortenedLineEnd(start, target);

	return (
		<line
			x1={start.x}
			y1={start.y}
			x2={end.x}
			y2={end.y}
			className="stroke-primary/70"
			strokeWidth={1}
			markerEnd={`url(#${markerId})`}
		/>
	);
}

function getShortenedLineEnd(start: ChartPoint, target: ChartPoint) {
	const dx = target.x - start.x;
	const dy = target.y - start.y;
	const distance = Math.sqrt(dx * dx + dy * dy) || 1;
	const unitX = dx / distance;
	const unitY = dy / distance;
	return {
		x: target.x - unitX * diphthongArrowGap,
		y: target.y - unitY * diphthongArrowGap,
	};
}
