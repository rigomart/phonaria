import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import {
	formatOrdinal,
	formatPercentage,
	type PhonemeFrequencySummary,
} from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";
import { DetailsLink } from "./details-section";

/**
 * How common the sound is, as plain numbers: its rank among all sounds
 * ("22nd most common of 40") and its share of everyday speech, with a bar on the same
 * scale as the Frequency page. Where the host allows it, a text link opens
 * that page, which ranks them all. A plain link rather than a clickable block,
 * so it reads apart from the header's expand button.
 *
 * `stacked` sets it as a column, for the compact level's narrow space beside
 * the diagram.
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
	const rank = formatOrdinal(frequency.rank);
	const share = formatPercentage(frequency.percentage);
	const link = showLink ? (
		<DetailsLink href={IPA_CHART_FREQUENCY_PATH}>See ranking</DetailsLink>
	) : null;

	const rankNumber = (
		<span
			className={cn("font-display font-semibold text-foreground", stacked ? "text-2xl" : "text-lg")}
		>
			{rank}
		</span>
	);

	return (
		<div className={cn("flex flex-col gap-2", stacked && "h-full")}>
			{stacked ? (
				<p className="flex flex-col text-xs text-muted-foreground tabular-nums">
					{rankNumber}
					<span>most common of {frequency.count}</span>
					<span className="mt-1">{share} of speech</span>
				</p>
			) : (
				<p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted-foreground tabular-nums">
					<span>
						{rankNumber} most common of {frequency.count} sounds
					</span>
					<span>{share} of speech</span>
					{link ? <span className="ml-auto">{link}</span> : null}
				</p>
			)}
			<span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-accent">
				<span
					className="block h-full rounded-full bg-primary"
					style={{ width: `${frequency.relativeShare * 100}%` }}
				/>
			</span>
			{stacked && link ? <div className="mt-auto pt-1">{link}</div> : null}
		</div>
	);
}
