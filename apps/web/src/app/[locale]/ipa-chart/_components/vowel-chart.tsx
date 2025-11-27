"use client";

import type { CSSProperties } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type ChartPoint, getVowelPoint } from "@/lib/vowel-chart-geometry";
import { useScopedI18n } from "@/locales/client";
import type { StaticVowelChartEntry } from "../_lib/vowel-chart-data";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import {
	getMarkerPercentPosition,
	VowelChartSurface,
	vowelChartLayout,
	vowelMarkerButtonBaseClass,
} from "./vowel-chart-surface";

type MonophthongVowelChartProps = {
	entries: StaticVowelChartEntry[];
};

type VowelMarkerData = {
	entry: StaticVowelChartEntry;
	start: ChartPoint;
	offset: MarkerOffset;
};

type MarkerOffset = {
	x: number;
	y: number;
};

const BASE_MARKER_OFFSET: MarkerOffset = { x: 0, y: 0 };
const MARKER_OFFSET_RADIUS = 14;

export function MonophthongVowelChart({ entries }: MonophthongVowelChartProps) {
	const keyCounts = new Map<string, number>();
	for (const entry of entries) {
		const key = getMarkerGroupKey(entry);
		keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
	}

	const groupOffsets = new Map<string, MarkerOffset[]>();
	for (const [key, count] of keyCounts.entries()) {
		groupOffsets.set(key, getMarkerOffsets(count));
	}

	const groupUsageIndex = new Map<string, number>();
	const markers: VowelMarkerData[] = entries.map((entry) => {
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

	return (
		<VowelChartSurface
			overlay={markers.map((marker) => <VowelMarker key={marker.entry.id} marker={marker} />)}
		/>
	);
}

function VowelMarker({ marker }: { marker: VowelMarkerData }) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const handleSelect = () => selectPhoneme(marker.entry.id);
	const { leftPercent, topPercent } = getMarkerPercentPosition(marker.start, vowelChartLayout);
	const offsetX = marker.offset?.x ?? 0;
	const offsetY = marker.offset?.y ?? 0;
	const buttonStyles = {
		"--marker-left": `${leftPercent}%`,
		"--marker-top": `${topPercent}%`,
		"--marker-offset-x": `${offsetX}px`,
		"--marker-offset-y": `${offsetY}px`,
	};
	const ariaLabel = `${marker.entry.label} (${marker.entry.ipa})`;
	const isRounded = marker.entry.features.roundness === "rounded";
	const isRhotic = marker.entry.vowelType === "rhotic";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleSelect}
					className={cn(
						vowelMarkerButtonBaseClass,
						"left-[calc(var(--marker-left)-0.75rem+var(--marker-offset-x))] top-[calc(var(--marker-top)-0.75rem+var(--marker-offset-y))]",
						"sm:left-[calc(var(--marker-left)-1.125rem+var(--marker-offset-x))] sm:top-[calc(var(--marker-top)-1.125rem+var(--marker-offset-y))]",
						"hover:scale-110 hover:z-10 active:scale-95",
						{
							"border-transparent bg-primary text-primary-foreground rounded-full size-6 sm:size-9 hover:bg-primary/90":
								isRounded && !isRhotic,
							"border-primary bg-background text-foreground rounded-full size-6 sm:size-9 hover:bg-primary/5 hover:border-primary/80":
								!isRounded && !isRhotic,
							"border-dashed border-primary bg-primary/10 text-foreground rounded-full size-6 sm:size-9 hover:bg-primary/20 hover:border-primary/80":
								isRhotic,
						},
					)}
					style={buttonStyles as CSSProperties}
					aria-label={ariaLabel}
				>
					{marker.entry.ipa}
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" align="center">
				<div className="max-w-xs text-pretty text-xs leading-snug font-semibold">
					{marker.entry.label}
				</div>
			</TooltipContent>
		</Tooltip>
	);
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

export function VowelChartLegend() {
	const t = useScopedI18n("ipa-chart.sections.vowels.legend");

	return (
		<div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-2.5 sm:size-3 rounded-full border border-primary" />
				<span>{t("unrounded")}</span>
			</div>
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-2.5 sm:size-3 rounded-full bg-primary" />
				<span>{t("rounded")}</span>
			</div>
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-2.5 sm:size-3 rounded-full border border-dashed border-primary bg-primary/10" />
				<span>{t("rhotic")}</span>
			</div>
		</div>
	);
}
