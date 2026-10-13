import { getLanguagePhonemeCount, type TargetAccent } from "@phonaria/phonetics-data";
import { type ChartSoundProps, parseChartSound } from "@/lib/ipa-chart/sound-search";
import { getDiphthongEntries, getMonophthongEntries } from "@/lib/ipa-chart/vowel-chart-data";
import { SoundDetailsLayout } from "./sound-details-layout";
import { VowelChart } from "./vowel-chart";

const targetAccent = "en-us" satisfies TargetAccent;
const phonemeCounts = getLanguagePhonemeCount(targetAccent);
const monophthongEntries = getMonophthongEntries(targetAccent);
const diphthongEntries = phonemeCounts.diphthongs > 0 ? getDiphthongEntries(targetAccent) : [];
const vowelEntries = [...monophthongEntries, ...diphthongEntries];
const vowelCount = phonemeCounts.monophthongs + phonemeCounts.diphthongs;

export function VowelsContent({ selectedSound, onSelectSound, onCloseSound }: ChartSoundProps) {
	return (
		<SoundDetailsLayout
			targetAccent={targetAccent}
			selectedId={parseChartSound(selectedSound, targetAccent, "vowels")}
			onSelect={onSelectSound}
			onClose={onCloseSound}
		>
			<div className="flex flex-1 flex-col items-center bg-background">
				<div className="w-full p-4 sm:p-6 max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
					<div className="flex flex-col gap-1">
						<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Vowels</h1>
						<p className="text-sm text-muted-foreground">
							{phonemeCounts.diphthongs > 0
								? `${vowelCount} American English vowel sounds: ${phonemeCounts.monophthongs} monophthongs and ${phonemeCounts.diphthongs} diphthongs.`
								: `${phonemeCounts.monophthongs} American English monophthong vowel sounds.`}{" "}
							Click any sound for details and available audio.
						</p>
					</div>

					<VowelChart entries={vowelEntries} />
				</div>
			</div>
		</SoundDetailsLayout>
	);
}
