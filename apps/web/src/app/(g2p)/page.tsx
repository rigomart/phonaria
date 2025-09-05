import { ExamplesSection } from "./_components/examples-section";
import { G2PInputForm } from "./_components/g2p-input-form";
import { PhonemeDetailPanel } from "./_components/phoneme-detail-panel";
import { TranscriptionDisplay } from "./_components/transcription-display";
import { WordDefinitionPanel } from "./_components/word-definition-panel";

export default function Index() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Main Content Area */}
					<div className="lg:col-span-7 space-y-6">
						{/* Input Section */}
						<div className="space-y-4">
							<G2PInputForm className="w-full" />

							{/* Quick Examples */}
							<ExamplesSection />
						</div>

						{/* Transcription Results or Empty State */}
						<TranscriptionDisplay />

						{/* Instructional Tip */}
						<div className="text-xs text-muted-foreground text-center">
							Click any phoneme to view details
						</div>
					</div>

					{/* Right Column: Definition over Phoneme details */}
					<div className="lg:col-span-5 space-y-6">
						<WordDefinitionPanel />
						<PhonemeDetailPanel />
					</div>
				</div>
			</div>
		</div>
	);
}
