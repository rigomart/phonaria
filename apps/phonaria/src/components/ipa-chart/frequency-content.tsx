import {
	EnglishPhonemeSpellingPatterns,
	getIpaForPhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Disclaimer } from "@/components/disclaimer";
import { PhonemeDetailsTrigger } from "@/components/phoneme-details/phoneme-details";
import { SpelledWord } from "@/components/spelled-word";
import { FREQUENCY_PAGE_HEADING } from "@/lib/ipa-chart-metadata";
import { enterDelay, stagger } from "@/lib/motion";
import {
	formatOrdinal,
	formatPercentage,
	type RankedPhoneme,
	rankPhonemes,
} from "@/lib/phoneme-frequency";
import { soundPagePath } from "@/lib/sound-pages";

const targetAccent = "en-us" satisfies TargetAccent;
const ranked = rankPhonemes(targetAccent);
const largest = ranked[0]?.percentage ?? 1;

// Rows cascade in after the title, and each bar fills just behind its row. Rows past
// the cap share its delay: they sit below the fold and should be ready when reached.
const ROW_STAGGER = { start: 40, step: 12, cap: 10 };
const BAR_LAG = 60;

export function FrequencyContent() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-3xl space-y-6 p-4 sm:p-6">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display enter-rise">
					{FREQUENCY_PAGE_HEADING}
				</h1>
				<ol className="flex flex-col">
					{ranked.map((sound, index) => (
						<RankingRow key={sound.phonemeId} sound={sound} index={index} />
					))}
				</ol>
				<Disclaimer
					className="enter-fade enter-delay-250"
					title="How the shares are estimated"
					points={[
						"Phonaria takes the 10,000 most common English words and counts the sounds in each word's dictionary pronunciation.",
						"Each word is weighted by how often it's used, according to wordfreq.",
						"Only a word's first listed pronunciation counts.",
						"People shorten and blend words when they talk, so the shares in real speech differ.",
					]}
					sources={[
						{ key: "wordfreq", label: "wordfreq" },
						{ key: "cmu", label: "CMU Pronouncing Dictionary" },
					]}
				>
					These shares are estimated from how often words are used, not measured from recorded
					speech.
				</Disclaimer>
			</div>
		</div>
	);
}

function RankingRow({
	sound,
	index,
}: {
	sound: RankedPhoneme<typeof targetAccent>;
	index: number;
}) {
	const ipa = getIpaForPhonemeId(sound.phonemeId);
	const example = EnglishPhonemeSpellingPatterns[sound.phonemeId].examples[0];
	const share = formatPercentage(sound.percentage);
	const relativeShare = sound.percentage / largest;
	const rowDelay = stagger(index, ROW_STAGGER);

	return (
		<li className="enter-rise" style={enterDelay(rowDelay)}>
			<PhonemeDetailsTrigger
				details={{ targetAccent, phonemeId: sound.phonemeId, showFrequencyLink: false }}
				nativeButton={false}
				render={
					<a
						href={soundPagePath(sound.phonemeId)}
						aria-label={`/${ipa}/ as in ${example.word}: ${formatOrdinal(sound.rank)}, ${share}`}
						className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-details-open:bg-accent motion-reduce:transition-none"
					/>
				}
			>
				<span className="w-7 shrink-0 text-xs tabular-nums text-muted-foreground sm:w-8">
					{sound.rank}
				</span>
				<span className="w-12 shrink-0 font-display text-lg leading-none sm:w-14">
					<span className="sound-trigger relative pb-1">{ipa}</span>
				</span>
				<span className="w-22 shrink-0 truncate text-sm text-muted-foreground sm:w-28">
					<SpelledWord spelled={example.spelled} />
				</span>
				<span
					aria-hidden="true"
					className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-accent"
				>
					<span
						className="block h-full rounded-full enter-grow-x"
						style={{
							...enterDelay(rowDelay + BAR_LAG),
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
