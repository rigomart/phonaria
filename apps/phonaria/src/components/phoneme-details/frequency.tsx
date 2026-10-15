import { ChevronRight } from "lucide-react";
import { Link } from "@/components/link";
import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import { formatOrdinal, type PhonemeFrequencySummary } from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";

/**
 * How common the sound is: a bar on the Frequency page's scale and its rank
 * ("2nd most common"; screen readers also hear "of 40 sounds"). Where the host
 * allows it, the whole line opens the Frequency page, which ranks them all.
 */
export function SoundFrequency({
	frequency,
	showLink,
}: {
	frequency: PhonemeFrequencySummary;
	showLink: boolean;
}) {
	const rank = `${formatOrdinal(frequency.rank)} most common`;
	const content = (
		<>
			<span
				aria-hidden="true"
				className="h-1.5 w-8 shrink-0 overflow-hidden rounded-full bg-accent"
			>
				<span
					className={cn("block h-full rounded-full", frequency.band.barClass)}
					style={{ width: `${frequency.fill * 100}%` }}
				/>
			</span>
			<span className="font-medium text-foreground">{rank}</span>
		</>
	);

	if (!showLink) {
		return (
			<p
				aria-label={`${rank} of ${frequency.count} sounds`}
				className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums whitespace-nowrap"
			>
				{content}
			</p>
		);
	}

	return (
		<Link
			href={IPA_CHART_FREQUENCY_PATH}
			aria-label={`${rank} of ${frequency.count} sounds. See all sounds by frequency`}
			className="group/frequency relative flex w-fit items-center gap-2 rounded-full text-sm whitespace-nowrap text-muted-foreground tabular-nums transition-colors after:absolute after:-inset-x-2 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			{content}
			<ChevronRight
				aria-hidden="true"
				className="size-4 shrink-0 transition-transform group-hover/frequency:translate-x-0.5 motion-reduce:transition-none"
			/>
		</Link>
	);
}
