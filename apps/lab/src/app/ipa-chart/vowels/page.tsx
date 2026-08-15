import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";
import { ScrollArea } from "@phonaria/ui/components/scroll-area";
import type { Metadata } from "next";
import { MonophthongVowelChart, VowelChartLegend } from "../_components/vowel-chart";
import { getMonophthongEntries } from "../_lib/vowel-chart-data";

export const metadata: Metadata = {
	title: "Vowels — IPA Chart",
	description: "Interactive IPA chart for American English vowels.",
};

const phonemeCounts = getLanguagePhonemeCount("en-us");
const vowelEntries = getMonophthongEntries();

export default function VowelsPage() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full p-4 sm:p-6 max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
				<div className="flex flex-col gap-1">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Vowels</h1>
					<p className="text-sm text-muted-foreground">
						{phonemeCounts.monophthongs} American English monophthong vowel sounds. Click any sound
						for details and audio.
					</p>
				</div>

				<VowelChartLegend />

				<ScrollArea className="w-full">
					<div className="flex justify-center">
						<div className="w-full max-w-2xl min-w-96 shrink-0">
							<MonophthongVowelChart entries={vowelEntries} />
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
