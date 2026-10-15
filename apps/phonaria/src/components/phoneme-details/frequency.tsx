import { ChevronRight } from "lucide-react";
import { Link } from "@/components/link";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import {
	type FREQUENCY_BANDS,
	formatOrdinal,
	type PhonemeFrequencySummary,
} from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";

type MeterHeights = readonly string[] & { length: typeof FREQUENCY_BANDS.length };

/** One bar per band, rising like a signal meter: rare lights the first, very common all of them. */
const METERS = {
	inline: { heights: ["h-2", "h-3", "h-4", "h-5"], bar: "w-1", gap: "gap-0.5" },
	stacked: { heights: ["h-3", "h-5", "h-7", "h-9"], bar: "w-1.5", gap: "gap-1" },
} as const satisfies Record<string, { heights: MeterHeights; bar: string; gap: string }>;

/**
 * How common the sound is: a meter lit up to its band, the band's name
 * ("Less common"), and its rank among all sounds ("34th of 40"). Where the host
 * allows it, the whole block opens the Frequency page, which ranks them all.
 *
 * `stacked` puts the meter above the words, for the compact level's narrow
 * column beside the diagram.
 */
export function SoundFrequency({
	frequency,
	showLink,
	stacked = false,
}: {
	frequency: PhonemeFrequencySummary;
	showLink: boolean;
	stacked?: boolean;
}) {
	const label = `${frequency.band.label}: ${formatOrdinal(frequency.rank)} most common of ${frequency.count} sounds`;
	const meter = METERS[stacked ? "stacked" : "inline"];
	const chevron = showLink ? (
		<ChevronRight
			aria-hidden="true"
			className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/frequency:translate-x-0.5 group-hover/frequency:text-foreground motion-reduce:transition-none"
		/>
	) : null;
	const bars = (
		<span aria-hidden="true" className={cn("flex shrink-0 items-end", meter.gap)}>
			{meter.heights.map((height, index) => (
				<span
					key={height}
					className={cn(
						"rounded-full",
						meter.bar,
						height,
						index < frequency.level ? frequency.band.barClass : "bg-accent",
					)}
				/>
			))}
		</span>
	);
	const words = (
		<span className="flex min-w-0 flex-col">
			<span className={cn("font-medium text-foreground", stacked ? "text-base" : "text-sm")}>
				{frequency.band.label}
			</span>
			<span className="text-xs text-muted-foreground tabular-nums">
				{formatOrdinal(frequency.rank)} of {frequency.count} sounds
			</span>
		</span>
	);
	const content = stacked ? (
		<>
			<span className="flex items-start justify-between">
				{bars}
				{chevron}
			</span>
			{words}
		</>
	) : (
		<>
			{bars}
			{words}
			{chevron}
		</>
	);
	const layout = stacked ? "flex flex-col gap-2" : "flex w-fit items-center gap-3";

	if (!showLink) {
		return (
			<p aria-label={label} className={cn(layout, "whitespace-nowrap")}>
				{content}
			</p>
		);
	}

	return (
		<Link
			href={IPA_CHART_FREQUENCY_PATH}
			aria-label={`${label}. See all sounds by frequency`}
			className={cn(
				layout,
				"group/frequency -m-2 rounded-xl p-2 whitespace-nowrap transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
			)}
		>
			{content}
		</Link>
	);
}
