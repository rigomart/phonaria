import { ArrowRight } from "lucide-react";
import { Link } from "@/components/link";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import type { PhonemeFrequencySummary } from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";
import { DetailsCard } from "./details-section";

/** The sound's band and rank among all sounds, with a meter for its position. */
export function FrequencyMeter({ frequency }: { frequency: PhonemeFrequencySummary }) {
	return (
		<DetailsCard className="flex flex-col gap-3">
			<p className="flex items-baseline justify-between gap-2 text-sm">
				<span className="font-medium">{frequency.band.label}</span>
				<span className="text-muted-foreground tabular-nums">{frequency.ranking}</span>
			</p>
			<span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-accent">
				<span
					className={cn("block h-full rounded-full", frequency.band.barClass)}
					style={{ width: `${frequency.position * 100}%` }}
				/>
			</span>
		</DetailsCard>
	);
}

/** Opens the Frequency page with every sound ranked. */
export function AllSoundsLink() {
	return (
		<Link
			href={IPA_CHART_FREQUENCY_PATH}
			className="relative inline-flex items-center gap-1 rounded-full text-sm text-muted-foreground transition-colors after:absolute after:-inset-x-2 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			All sounds
			<ArrowRight aria-hidden="true" className="size-4" />
		</Link>
	);
}
