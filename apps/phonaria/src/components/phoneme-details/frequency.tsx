import { IPA_CHART_FREQUENCY_PATH } from "@/lib/ipa-chart-metadata";
import {
	formatOrdinal,
	formatPercentage,
	type PhonemeFrequencySummary,
} from "@/lib/phoneme-frequency";
import { DetailsLink } from "./details-section";

/**
 * How common the sound is: its share of everyday speech in a tile, then its
 * rank among all sounds ("22nd most common of 40 sounds"). Where the host
 * allows it, a text link opens the Frequency page, which ranks them all.
 *
 * `stacked` sets it as a column with a bar on the same scale as the Frequency
 * page, for the compact level's narrow space beside the diagram.
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

	if (!stacked) {
		return (
			<div className="flex items-center gap-3 rounded-2xl bg-background py-2 pr-3 pl-2">
				<span className="rounded-xl bg-secondary px-2.5 py-1 font-display text-lg leading-tight font-semibold text-foreground tabular-nums">
					{share}
					<span className="sr-only"> of everyday speech</span>
				</span>
				<p className="min-w-0 flex-1 text-sm text-muted-foreground tabular-nums">
					<span className="font-semibold text-foreground">{rank}</span> most common of{" "}
					{frequency.count} sounds
				</p>
				{link ? <span className="shrink-0 text-xs">{link}</span> : null}
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-2">
			<p className="flex flex-col text-xs text-muted-foreground tabular-nums">
				<span className="font-display text-2xl font-semibold text-foreground">{rank}</span>
				<span>most common of {frequency.count}</span>
				<span className="mt-1">about {share} of speech</span>
			</p>
			<span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-accent">
				<span
					className="block h-full rounded-full bg-primary"
					style={{ width: `${frequency.relativeShare * 100}%` }}
				/>
			</span>
			{link ? <div className="mt-auto pt-1">{link}</div> : null}
		</div>
	);
}
