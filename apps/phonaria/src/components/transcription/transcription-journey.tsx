"use client";

import { useSearch } from "@tanstack/react-router";
import { TranscriptionProvider } from "@/hooks/use-transcribe";
import type { TranscribeWordsFn } from "@/lib/transcription/g2p-store";
import type { ChooseSpellingInContextFn } from "@/lib/transcription/spelling-context";
import { TranscriptionDisplay } from "./display";
import { G2PInputForm } from "./g2p-input-form";
import { TranscriptionSearchSync } from "./transcription-search-sync";

export function TranscriptionJourney({
	transcribeWords,
	chooseSpellingInContext,
}: {
	transcribeWords: TranscribeWordsFn;
	chooseSpellingInContext?: ChooseSpellingInContextFn;
}) {
	const { q } = useSearch({ from: "/" });

	return (
		<TranscriptionProvider
			transcribeWords={transcribeWords}
			chooseSpellingInContext={chooseSpellingInContext}
		>
			<TranscriptionSearchSync query={q} />
			<div className="flex flex-1 flex-col">
				<div className="flex flex-1 flex-col items-center pt-[8vh]">
					<div className="w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
						<G2PInputForm />
					</div>

					<div className="w-full min-h-0">
						<TranscriptionDisplay targetAccent="en-us" query={q} />
					</div>
				</div>
			</div>
		</TranscriptionProvider>
	);
}
