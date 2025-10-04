import { G2PInputForm } from "./_components/g2p-input-form";
import { PhonemeInspector } from "./_components/phoneme-inspector";
import { TranscriptionDisplay } from "./_components/transcription-display";
import { WordDefinitionDialog } from "./_components/word-definition-dialog";

export default function Index() {
	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto h-full min-h-0">
				<div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-0 border">
					{/* Main Content Area */}
					<div className="lg:col-span-7 min-h-0 overflow-y-auto">
						{/* Input Section */}
						<div className="border-b p-6">
							<G2PInputForm />
						</div>

						{/* Transcription Results or Empty State */}
						<TranscriptionDisplay />
					</div>

					{/* Right Column: Stacked summary blocks */}
					<div className="lg:col-span-5 space-y-6 border flex-1 flex flex-col min-h-0 overflow-hidden">
						<PhonemeInspector />
					</div>
				</div>
				<WordDefinitionDialog />
			</div>
		</div>
	);
}
