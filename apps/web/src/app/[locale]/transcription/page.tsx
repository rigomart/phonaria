import { G2PInputForm } from "./_components/g2p-input-form";
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { PhonemeInspector } from "./_components/phoneme-inspector";
import { TranscriptionDisplay } from "./_components/transcription-display";
import { WordDefinitionDialog } from "./_components/word-definition-dialog";

export default function Index() {
	return (
		<div className="flex-1 min-h-0 h-full bg-background">
			<div className="container mx-auto h-full min-h-0 px-2 py-2 lg:py-3">
				<div className="grid h-full min-h-0 grid-rows-1 gap-3 grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 lg:items-stretch">
					<div className="flex h-full min-h-0 flex-col rounded-xl border bg-background-soft shadow-sm lg:col-span-7">
						<div className="border-b px-4 py-3 lg:px-5 lg:py-4">
							<G2PInputForm />
						</div>
						<TranscriptionDisplay />
					</div>

					<div className="hidden lg:flex lg:min-h-0 lg:max-h-[calc(100dvh-9rem)] lg:flex-1 lg:flex-col rounded-xl bg-background-soft overflow-hidden shadow-sm lg:col-span-5">
						<PhonemeInspector />
					</div>
				</div>

				<PhonemeDialog />
				<WordDefinitionDialog />
			</div>
		</div>
	);
}
