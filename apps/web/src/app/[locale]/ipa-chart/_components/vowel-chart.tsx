"use client";

import type { CSSProperties } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getVowelPoint, type ChartPoint } from "@/lib/vowel-chart-geometry";
import { useScopedI18n } from "@/locales/client";
import type { StaticVowelChartEntry } from "../_lib/vowel-chart-data";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import {
	VowelChartSurface,
	getMarkerPercentPosition,
	vowelChartLayout,
	vowelMarkerButtonBaseClass,
} from "./vowel-chart-surface";

type MonophthongVowelChartProps = {
	entries: StaticVowelChartEntry[];
};

type VowelMarkerData = {
	entry: StaticVowelChartEntry;
	start: ChartPoint;
};

export function MonophthongVowelChart({ entries }: MonophthongVowelChartProps) {
	const markers: VowelMarkerData[] = entries.map((entry) => ({
		entry,
		start: getVowelPoint(entry.features.height, entry.features.backness, vowelChartLayout),
	}));

	return (
		<VowelChartSurface
			overlay={
				<>
					{markers.map((marker) => (
						<VowelMarker key={marker.entry.id} marker={marker} />
					))}
				</>
			}
		/>
	);
}

function VowelMarker({ marker }: { marker: VowelMarkerData }) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const handleSelect = () => selectPhoneme(marker.entry.id);
	const { leftPercent, topPercent } = getMarkerPercentPosition(marker.start, vowelChartLayout);
	const buttonStyles: CSSProperties = {
		left: `calc(${leftPercent}% - ${markerSize / 2}px)`,
		top: `calc(${topPercent}% - ${markerSize / 2}px)`,
	};
	const ariaLabel = `${marker.entry.label} (${marker.entry.ipa})`;
	const isRounded = marker.entry.features.roundness === "rounded";
	const roundedButtonClasses =
		"border-primary bg-background text-foreground rounded-full w-8 h-8 sm:w-10 sm:h-10";
	const unroundedButtonClasses =
		"border-transparent bg-primary text-primary-foreground rounded-sm w-8 h-8 sm:w-9 sm:h-9";
	const buttonClasses = isRounded ? roundedButtonClasses : unroundedButtonClasses;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleSelect}
					className={cn(vowelMarkerButtonBaseClass, buttonClasses)}
					style={buttonStyles}
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

const markerSize = 44;

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

