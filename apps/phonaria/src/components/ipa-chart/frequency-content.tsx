"use client";

import {
	EnglishPhonemeSpellingPatterns,
	getIpaForPhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { SpelledWord } from "@/components/spelled-word";
import {
	FREQUENCY_BANDS,
	formatOrdinal,
	formatPercentage,
	type RankedPhoneme,
	rankPhonemes,
} from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";

const targetAccent = "en-us" satisfies TargetAccent;
const ranked = rankPhonemes(targetAccent);
const largest = ranked[0]?.percentage ?? 1;

export function FrequencyContent() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-3xl space-y-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Frequency</h1>
					<FrequencyLegend />
				</div>
				<ol className="flex flex-col">
					{ranked.map((sound) => (
						<RankingRow key={sound.phonemeId} sound={sound} />
					))}
				</ol>
			</div>
		</div>
	);
}

function FrequencyLegend() {
	return (
		<ul
			aria-label="Bar colors"
			className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"
		>
			{FREQUENCY_BANDS.map(({ label, barClass }) => (
				<li key={label} className="flex items-center gap-1.5">
					<span aria-hidden="true" className={cn("h-2 w-4 rounded-full", barClass)} />
					{label}
				</li>
			))}
		</ul>
	);
}

function RankingRow({ sound }: { sound: RankedPhoneme<typeof targetAccent> }) {
	const ipa = getIpaForPhonemeId(sound.phonemeId);
	const example = EnglishPhonemeSpellingPatterns[sound.phonemeId].examples[0];
	const share = formatPercentage(sound.percentage);

	return (
		<li>
			<Popover>
				<PopoverTrigger
					render={
						<button
							type="button"
							aria-label={`/${ipa}/ as in ${example.word}: ${formatOrdinal(sound.rank)}, ${share}, ${sound.band.label.toLowerCase()}`}
							className="grid w-full grid-cols-[1.75rem_3rem_5.5rem_1fr_3.5rem] items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted motion-reduce:transition-none sm:grid-cols-[2rem_3.5rem_7rem_1fr_4rem]"
						/>
					}
				>
					<span className="text-xs tabular-nums text-muted-foreground">{sound.rank}</span>
					<span className="font-display text-lg leading-none">{ipa}</span>
					<span className="truncate text-sm text-muted-foreground">
						<SpelledWord spelled={example.spelled} />
					</span>
					<span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-accent">
						<span
							className={cn("block h-full rounded-full", sound.band.barClass)}
							style={{ width: `${(sound.percentage / largest) * 100}%` }}
						/>
					</span>
					<span className="text-right text-sm tabular-nums">{share}</span>
				</PopoverTrigger>
				<PopoverContent sideOffset={8}>
					<PhonemePopoverContent
						targetAccent={targetAccent}
						phonemeId={sound.phonemeId}
						showFrequencyLink={false}
					/>
				</PopoverContent>
			</Popover>
		</li>
	);
}
