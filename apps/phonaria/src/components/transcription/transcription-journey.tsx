import { useSearch } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";
import { TranscriptionProvider } from "@/hooks/use-transcribe";
import { useRecordTranscriptionHistory } from "@/hooks/use-transcription-history";
import { parseSoundsParam } from "@/lib/sound-search/search";
import type { TranscribeWordsFn } from "@/lib/transcription/g2p-store";
import type { ChooseSpellingInContextFn } from "@/lib/transcription/spelling-context";
import { Composer } from "./composer";
import { TranscriptionDisplay } from "./display";
import { EmptyState } from "./display/empty-state";
import { HomeIntro } from "./home-intro";
import { SoundResults } from "./sound-search/sound-results";
import { SoundSearchProvider, useSoundSearch } from "./sound-search/use-sound-search";
import { TranscriptionSearchSync } from "./transcription-search-sync";

type JourneyProps = {
	transcribeWords: TranscribeWordsFn;
	chooseSpellingInContext?: ChooseSpellingInContextFn;
};

function Journey({
	transcribeWords,
	chooseSpellingInContext,
	live,
	children,
}: JourneyProps & {
	live: boolean;
	children: ReactNode;
}) {
	useRecordTranscriptionHistory();
	return (
		<TranscriptionProvider
			transcribeWords={transcribeWords}
			chooseSpellingInContext={chooseSpellingInContext}
		>
			<SoundSearchProvider live={live}>{children}</SoundSearchProvider>
		</TranscriptionProvider>
	);
}

/** Arriving here drops any result left in the store. */
export function HomeJourney(props: JourneyProps) {
	return (
		<Journey {...props} live={false}>
			<TranscriptionSearchSync query={undefined} />
			<div className="flex flex-1 flex-col items-center pt-[8vh]">
				<HomeIntro />

				<div className="w-full max-w-2xl px-4 enter-rise enter-delay-60">
					<Composer />
				</div>

				<HomeBelowInput />
			</div>
		</Journey>
	);
}

function HomeBelowInput() {
	const { mode } = useSoundSearch();
	return mode === "sounds" ? null : <EmptyState />;
}

export function SearchJourney(props: JourneyProps) {
	const { q, sounds } = useSearch({ from: "/search" });
	const pickedSounds = useMemo(() => parseSoundsParam(sounds), [sounds]);

	return (
		<Journey {...props} live>
			<TranscriptionSearchSync query={q} />
			<div className="flex flex-1 flex-col items-center pt-6 md:pt-10">
				<div className="w-full max-w-2xl px-4">
					<Composer />
				</div>

				<div className="w-full min-h-0">
					{sounds !== undefined ? (
						<SoundResults sounds={pickedSounds} />
					) : (
						<TranscriptionDisplay targetAccent="en-us" query={q} />
					)}
				</div>
			</div>
		</Journey>
	);
}
