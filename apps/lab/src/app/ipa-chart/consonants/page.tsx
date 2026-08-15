import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";
import { ScrollArea, ScrollBar } from "@phonaria/ui/components/scroll-area";
import type { Metadata } from "next";
import { ConsonantChart } from "../_components/consonant-chart";

export const metadata: Metadata = {
	title: "Consonants — IPA Chart",
	description: "Interactive IPA chart for American English consonants.",
};

const phonemeCounts = getLanguagePhonemeCount("en-us");

export default function ConsonantsPage() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background p-4 sm:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
			<div className="w-full max-w-5xl flex flex-col gap-1">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Consonants</h1>
				<p className="text-sm text-muted-foreground">
					{phonemeCounts.consonants} American English consonant sounds. Click any sound for details
					and audio.
				</p>
			</div>

			<div className="w-full max-w-5xl">
				<ConsonantChartLegend />
			</div>

			<ScrollArea className="w-full">
				<div className="flex justify-center">
					<ConsonantChart />
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

function ConsonantChartLegend() {
	return (
		<div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-4 rounded-md border border-border bg-background" />
				<span>Voiceless</span>
			</div>
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="size-4 rounded-md border border-primary/20 bg-primary/15" />
				<span>Voiced</span>
			</div>
		</div>
	);
}
