"use client";

import type { CSSProperties } from "react";
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
			svgOverlay={geometries.map((geometry) => (
				<DiphthongPath key={geometry.entry.id} start={geometry.start} target={geometry.target} />
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
	const startStyles: CSSProperties = {
		left: `calc(${startPercents.leftPercent}% - 12px)`,
		top: `calc(${startPercents.topPercent}% - 12px)`,
	};
	const buttonStyles: CSSProperties = {
		left: `calc(${midPercents.leftPercent}% - 18px)`,
		top: `calc(${midPercents.topPercent}% - 18px)`,
	};
	const targetStyles: CSSProperties = {
		left: `calc(${targetPercents.leftPercent}% - 12px)`,
		top: `calc(${targetPercents.topPercent}% - 12px)`,
	};

	return (
		<>
			<div
				className={cn("absolute shadow-sm rounded-full size-5 sm:size-6", {
					"bg-primary text-primary-foreground": startRounded,
					"border border-primary bg-background text-foreground": !startRounded,
				})}
				style={startStyles}
				aria-hidden
			/>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={handleSelect}
						className={cn(
							vowelMarkerButtonBaseClass,
							"border-primary/70 bg-background text-foreground rounded-full shadow-sm size-6 sm:size-9",
						)}
						style={buttonStyles}
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
				className={cn("absolute shadow-sm rounded-full size-5 sm:size-6", {
					"bg-primary text-primary-foreground": targetRounded,
					"border border-primary bg-background text-foreground": !targetRounded,
				})}
				style={targetStyles}
				aria-hidden
			/>
		</>
	);
}

function DiphthongPath({ start, target }: { start: ChartPoint; target: ChartPoint }) {
	const end = getShortenedLineEnd(start, target);

	return (
		<line
			x1={start.x}
			y1={start.y}
			x2={end.x}
			y2={end.y}
			className="stroke-primary/80"
			strokeWidth={2}
			markerEnd="url(#vowel-arrow-head)"
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
