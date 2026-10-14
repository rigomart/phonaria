import { ArrowRight } from "lucide-react";
import { Link } from "@/components/link";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import type { PhonemeFrequencySummary } from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";

/**
 * How common the sound is, in one line: its band, marked with the Frequency
 * page's band colour, and its rank. `showLink` adds "All sounds" opposite.
 */
export function SoundFrequency({
	frequency,
	showLink,
}: {
	frequency: PhonemeFrequencySummary;
	showLink: boolean;
}) {
	return (
		<div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm leading-4">
			<p className="flex items-center gap-1.5 whitespace-nowrap">
				<span
					aria-hidden="true"
					className={cn("h-2 w-4 shrink-0 rounded-full", frequency.band.barClass)}
				/>
				<span>
					<span className="font-medium">{frequency.band.label}</span>
					<span className="text-muted-foreground tabular-nums"> · {frequency.ranking}</span>
				</span>
			</p>
			{showLink ? <AllSoundsLink /> : null}
		</div>
	);
}

/** Opens the Frequency page with every sound ranked. */
function AllSoundsLink() {
	return (
		<Link
			href={IPA_CHART_FREQUENCY_PATH}
			className="relative ms-auto inline-flex shrink-0 items-center gap-1 rounded-full text-muted-foreground transition-colors after:absolute after:-inset-x-2 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			All sounds
			<ArrowRight aria-hidden="true" className="size-4" />
		</Link>
	);
}
