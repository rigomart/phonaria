"use client";

import {
	EnglishPhonemeSpellingPatterns,
	getIpaForPhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Link } from "@/components/link";
import { PhonemeDetailsTrigger } from "@/components/phoneme-details/phoneme-details";
import { SpelledWord } from "@/components/spelled-word";
import {
	formatOrdinal,
	formatPercentage,
	type RankedPhoneme,
	rankPhonemes,
} from "@/lib/phoneme-frequency";

const targetAccent = "en-us" satisfies TargetAccent;
const ranked = rankPhonemes(targetAccent);
const largest = ranked[0]?.percentage ?? 1;

export function FrequencyContent() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-3xl space-y-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Frequency</h1>
				<ol className="flex flex-col">
					{ranked.map((sound) => (
						<RankingRow key={sound.phonemeId} sound={sound} />
					))}
				</ol>
				<p className="text-xs text-muted-foreground">
					Based on how often words are used in everyday English (wordfreq).{" "}
					<Link
						href="/credits"
						className="rounded-sm underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Sources
					</Link>
				</p>
			</div>
		</div>
	);
}

function RankingRow({ sound }: { sound: RankedPhoneme<typeof targetAccent> }) {
	const ipa = getIpaForPhonemeId(sound.phonemeId);
	const example = EnglishPhonemeSpellingPatterns[sound.phonemeId].examples[0];
	const share = formatPercentage(sound.percentage);
	const relativeShare = sound.percentage / largest;

	return (
		<li>
			<PhonemeDetailsTrigger
				details={{ targetAccent, phonemeId: sound.phonemeId, showFrequencyLink: false }}
				render={
					<button
						type="button"
						aria-label={`/${ipa}/ as in ${example.word}: ${formatOrdinal(sound.rank)}, ${share}`}
						className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-details-open:bg-accent motion-reduce:transition-none"
					/>
				}
			>
				<span className="w-7 shrink-0 text-xs tabular-nums text-muted-foreground sm:w-8">
					{sound.rank}
				</span>
				<span className="w-12 shrink-0 font-display text-lg leading-none sm:w-14">{ipa}</span>
				<span className="w-22 shrink-0 truncate text-sm text-muted-foreground sm:w-28">
					<SpelledWord spelled={example.spelled} />
				</span>
				<span
					aria-hidden="true"
					className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-accent"
				>
					<span
						className="block h-full rounded-full"
						style={{
							width: `${relativeShare * 100}%`,
							backgroundColor: `color-mix(in oklch, var(--frequency-high) ${relativeShare * 100}%, var(--frequency-low))`,
						}}
					/>
				</span>
				<span className="w-14 shrink-0 text-right text-sm tabular-nums sm:w-16">{share}</span>
			</PhonemeDetailsTrigger>
		</li>
	);
}
