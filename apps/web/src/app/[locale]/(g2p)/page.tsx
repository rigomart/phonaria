import { ExamplesSection } from "./_components/examples-section";
import { G2PInputForm } from "./_components/g2p-input-form";
import { SideInspector } from "./_components/side-inspector";
import { TranscriptionDisplay } from "./_components/transcription-display";

export default function Index() {
	return (
		<div className="flex-1 bg-background">
			<div className="container mx-auto h-full">
				<div className="grid grid-cols-1 lg:grid-cols-12 h-full border">
					{/* Main Content Area */}
					<div className="lg:col-span-7 space-y-6">
						{/* Input Section */}
						<div className="space-y-2 border-b p-6">
							<G2PInputForm />

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

					{/* Right Column: Stacked summary blocks */}
					<div className="lg:col-span-5 space-y-6 border flex-1 flex flex-col">
						<SideInspector />
					</div>
				</div>
			</div>
		</div>
	);
}
