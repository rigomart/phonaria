import { G2PInputForm } from "./_components/g2p-input-form";
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { PhonemeInspector } from "./_components/phoneme-inspector";
import { TranscriptionDisplay } from "./_components/transcription-display";
import { WordDefinitionDialog } from "./_components/word-definition-dialog";

export default function Index() {
	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto h-full min-h-0 px-2 py-3 lg:py-4">
				<div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
					<div className="flex min-h-0 flex-col rounded-xl border bg-background-soft shadow-sm">
						<div className="border-b px-4 py-3 lg:px-5 lg:py-4">
							<G2PInputForm />
						</div>
						<TranscriptionDisplay />
					</div>

					<div className="hidden min-h-0 rounded-xl border bg-background-soft shadow-sm lg:flex lg:flex-col lg:sticky lg:top-6">
						<PhonemeInspector />
					</div>
				</div>

				<PhonemeDialog />
				<WordDefinitionDialog />
			</div>
		</div>
	);
}
