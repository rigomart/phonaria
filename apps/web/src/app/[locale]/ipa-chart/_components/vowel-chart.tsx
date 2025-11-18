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
};

export function MonophthongVowelChart({ entries }: MonophthongVowelChartProps) {
	const markers: VowelMarkerData[] = entries.map((entry) => ({
		entry,
		start: getVowelPoint(entry.features.height, entry.features.backness, vowelChartLayout),
	}));

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
	const buttonStyles: CSSProperties = {
		left: `calc(${leftPercent}% - 16px)`,
		top: `calc(${topPercent}% - 16px)`,
	};
	const ariaLabel = `${marker.entry.label} (${marker.entry.ipa})`;
	const isRounded = marker.entry.features.roundness === "rounded";
	const isRhotic = marker.entry.category === "vowel/rhotic";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleSelect}
					className={cn(vowelMarkerButtonBaseClass, {
						"border-transparent bg-primary text-primary-foreground rounded-full size-6 sm:size-9":
							isRounded && !isRhotic,
						"border-primary bg-background text-foreground rounded-full size-6 sm:size-9":
							!isRounded && !isRhotic,
						"border-dashed border-primary bg-primary/10 text-foreground rounded-full size-6 sm:size-9":
							isRhotic,
					})}
					style={buttonStyles}
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

export function VowelChartLegend() {
	const t = useScopedI18n("ipa-chart.sections.vowels.legend");

	return (
		<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
			<div className="flex items-center gap-1">
				<span className="size-3 rounded-full border border-primary" />
				<span>{t("unrounded")}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="size-3 rounded-full bg-primary" />
				<span>{t("rounded")}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="size-3 rounded-full border border-dashed border-primary bg-primary/10" />
				<span>{t("rhotic")}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="h-0.5 w-6 bg-primary" />
				<span>{t("diphthong")}</span>
			</div>
		</div>
	);
}
