"use client";

import { TranscriptionProvider } from "@/hooks/use-transcribe";
import type { TranscribeWordsFn } from "@/lib/transcription/g2p-store";
import type { ChooseSpellingInContextFn } from "@/lib/transcription/spelling-context";
import { TranscriptionDisplay } from "./display";
import { G2PInputForm } from "./g2p-input-form";

export function TranscriptionJourney({
	transcribeWords,
	chooseSpellingInContext,
}: {
	transcribeWords: TranscribeWordsFn;
	chooseSpellingInContext?: ChooseSpellingInContextFn;
}) {
	return (
		<TranscriptionProvider
			transcribeWords={transcribeWords}
			chooseSpellingInContext={chooseSpellingInContext}
		>
			<div className="flex flex-1 flex-col">
				<div className="flex flex-1 flex-col items-center pt-[8vh]">
					<div className="w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
						<G2PInputForm />
					</div>

					<div className="w-full min-h-0">
						<TranscriptionDisplay targetAccent="en-us" />
					</div>
				</div>
			</div>
		</TranscriptionProvider>
	);
}
