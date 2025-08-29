import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { IpaPhoneme } from "shared-data";
import { EmptyState } from "@/components/g2p/empty-state";
import { G2PInputForm } from "@/components/g2p/g2p-input-form";
import { PhonemeDetailPanel } from "@/components/g2p/phoneme-detail-panel";
import { TranscriptionDisplay } from "@/components/g2p/transcription-display";
import { Button } from "@/components/ui/button";
import { useG2P } from "@/hooks/use-g2p";
import { getPhonemeBySymbol } from "@/lib/g2p-client";
import type { TranscribedPhoneme } from "@/types/g2p";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const [selectedPhoneme, setSelectedPhoneme] = useState<IpaPhoneme | null>(null);

	const g2p = useG2P();

	const handlePhonemeClick = (transcribedPhoneme: TranscribedPhoneme) => {
		// Get the full phoneme data if available
		const phonemeData = getPhonemeBySymbol(transcribedPhoneme.symbol);

		if (phonemeData) {
			setSelectedPhoneme(phonemeData);
		} else {
			// Handle unknown phonemes
			console.log(`Phoneme /${transcribedPhoneme.symbol}/ not found in database`);
		}
	};

	const handleClosePanel = () => {
		setSelectedPhoneme(null);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Compact Header */}
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<h1 className="text-lg font-medium">Phonemic Transcription</h1>
							<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Tool</span>
						</div>
						<div className="text-xs text-muted-foreground">Convert text to IPA notation</div>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					{/* Main Content Area */}
					<div className="lg:col-span-3 space-y-6">
						{/* Input Section */}
						<div className="space-y-4">
							<G2PInputForm
								onSubmit={g2p.transcribe}
								state={g2p.state as "idle" | "loading" | "success" | "error"}
								className="w-full"
							/>

							{/* Quick Examples */}
							<div className="flex flex-wrap gap-2">
								<span className="text-xs text-muted-foreground self-center mr-2">
									Or try these examples:
								</span>
								{["Judge the rhythm", "She chose well", "Through thick fog"].map((example) => (
									<Button
										key={example}
										type="button"
										onClick={() => g2p.transcribe(example)}
										className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-50"
										disabled={g2p.state === "loading"}
										size="sm"
									>
										"{example}"
									</Button>
								))}
							</div>
						</div>

						{/* Transcription Results or Empty State */}
						{g2p.result ? (
							<div className="space-y-4">
								<TranscriptionDisplay result={g2p.result} onPhonemeClick={handlePhonemeClick} />

								{/* Instructional Tip */}
								<div className="text-xs text-muted-foreground text-center">
									Click any phoneme to view details
								</div>
							</div>
						) : (
							<EmptyState />
						)}
					</div>

					{/* Detail Panel */}
					<div className="lg:col-span-2">
						<PhonemeDetailPanel phoneme={selectedPhoneme} onClose={handleClosePanel} />
					</div>
				</div>
			</div>
		</div>
	);
}
