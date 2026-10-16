import { getLanguagePhonemeCount, type TargetAccent } from "@phonaria/phonetics-data";
import { getDiphthongEntries, getMonophthongEntries } from "@/lib/ipa-chart/vowel-chart-data";
import { VowelChart } from "./vowel-chart";

const targetAccent = "en-us" satisfies TargetAccent;
const phonemeCounts = getLanguagePhonemeCount(targetAccent);
const monophthongEntries = getMonophthongEntries(targetAccent);
const diphthongEntries = phonemeCounts.diphthongs > 0 ? getDiphthongEntries(targetAccent) : [];
const vowelEntries = [...monophthongEntries, ...diphthongEntries];
const vowelCount = phonemeCounts.monophthongs + phonemeCounts.diphthongs;

export function VowelsContent() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full p-4 sm:p-6 max-w-5xl space-y-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display enter-rise">
						Vowels
					</h1>
					<p className="text-sm text-muted-foreground enter-rise enter-delay-40">
						{phonemeCounts.diphthongs > 0
							? `${vowelCount} American English vowel sounds: ${phonemeCounts.monophthongs} monophthongs and ${phonemeCounts.diphthongs} diphthongs.`
							: `${phonemeCounts.monophthongs} American English monophthong vowel sounds.`}{" "}
						Click any sound for details and available audio.
					</p>
				</div>

				<VowelChart targetAccent={targetAccent} entries={vowelEntries} />
			</div>
		</div>
	);
}
