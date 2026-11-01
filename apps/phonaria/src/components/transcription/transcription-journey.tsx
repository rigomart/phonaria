import { useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TranscriptionProvider } from "@/hooks/use-transcribe";
import { useRecordTranscriptionHistory } from "@/hooks/use-transcription-history";
import type { TranscribeWordsFn } from "@/lib/transcription/g2p-store";
import type { ChooseSpellingInContextFn } from "@/lib/transcription/spelling-context";
import { TranscriptionDisplay } from "./display";
import { EmptyState } from "./display/empty-state";
import { G2PInputForm } from "./g2p-input-form";
import { HomeIntro } from "./home-intro";
import { TranscriptionSearchSync } from "./transcription-search-sync";

type JourneyProps = {
	transcribeWords: TranscribeWordsFn;
	chooseSpellingInContext?: ChooseSpellingInContextFn;
};

function Journey({
	transcribeWords,
	chooseSpellingInContext,
	children,
}: JourneyProps & {
	children: ReactNode;
}) {
	useRecordTranscriptionHistory();
	return (
		<TranscriptionProvider
			transcribeWords={transcribeWords}
			chooseSpellingInContext={chooseSpellingInContext}
		>
			{children}
		</TranscriptionProvider>
	);
}

/** Arriving here drops any result left in the store. */
export function HomeJourney(props: JourneyProps) {
	return (
		<Journey {...props}>
			<TranscriptionSearchSync query={undefined} />
			<div className="flex flex-1 flex-col items-center pt-[8vh]">
				<HomeIntro />

				<div className="w-full max-w-2xl px-4 enter-rise enter-delay-60">
					<G2PInputForm />
				</div>

				<EmptyState />
			</div>
		</Journey>
	);
}

export function SearchJourney(props: JourneyProps) {
	const { q } = useSearch({ from: "/search" });

	return (
		<Journey {...props}>
			<TranscriptionSearchSync query={q} />
			<div className="flex flex-1 flex-col items-center pt-6 md:pt-10">
				<div className="w-full max-w-2xl px-4">
					<G2PInputForm />
				</div>

				<div className="w-full min-h-0">
					<TranscriptionDisplay targetAccent="en-us" query={q} />
				</div>
			</div>
		</Journey>
	);
}
