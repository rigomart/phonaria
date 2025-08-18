import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { IpaPhoneme } from "shared-data";
import { G2PInputForm } from "@/components/g2p/g2p-input-form";
import { TranscriptionDisplay } from "@/components/g2p/transcription-display";
import { useG2P } from "@/hooks/use-g2p";
import { getPhonemeBySymbol } from "@/lib/g2p-client";
import { PhonemeDialog } from "@/routes/(charts)/-components/chart/phoneme-dialog";
import type { TranscribedPhoneme } from "@/types/g2p";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const [selectedPhoneme, setSelectedPhoneme] = useState<IpaPhoneme | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const g2p = useG2P();

	const handlePhonemeClick = (transcribedPhoneme: TranscribedPhoneme) => {
		// Get the full phoneme data if available
		const phonemeData = getPhonemeBySymbol(transcribedPhoneme.symbol);

		if (phonemeData) {
			setSelectedPhoneme(phonemeData);
			setIsDialogOpen(true);
		} else {
			// Handle unknown phonemes - could show a message or alternate dialog
			console.log(`Phoneme /${transcribedPhoneme.symbol}/ not found in database`);
		}
	};

	return (
		<div className="mx-auto max-w-6xl space-y-16 p-4">
			{/* Hero Section - Brief and Less Prominent */}
			<div className="space-y-3 text-center py-8">
				<h1 className="text-2xl font-semibold tracking-tight">Phonemic Transcription Tool</h1>
				<p className="text-muted-foreground max-w-lg mx-auto">
					Convert text to IPA notation and explore individual phonemes
				</p>
			</div>

			{/* Example Sentences */}
			<div className="text-center space-y-4">
				<h2 className="text-lg font-medium">Try these examples:</h2>
				<div className="flex flex-wrap justify-center gap-3">
					{["hello world", "pronunciation", "phonetics", "international"].map((example) => (
						<button
							key={example}
							type="button"
							onClick={() => g2p.transcribe(example)}
							className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
							disabled={g2p.state === "loading"}
						>
							"{example}"
						</button>
					))}
				</div>
			</div>

			{/* Input Form */}
			<G2PInputForm
				onSubmit={g2p.transcribe}
				onClear={g2p.clear}
				state={g2p.state as "idle" | "loading" | "success" | "error"}
				className="w-full max-w-5xl mx-auto"
			/>

			{/* Transcription Results */}
			{g2p.result && (
				<TranscriptionDisplay result={g2p.result} onPhonemeClick={handlePhonemeClick} />
			)}

			{/* Tip Section */}
			{g2p.result && (
				<div className="text-center">
					<p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
						💡 Click on any phoneme in the transcription above to learn about its articulation and
						hear pronunciation examples
					</p>
				</div>
			)}

			{/* Phoneme Detail Dialog */}
			{selectedPhoneme && (
				<PhonemeDialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<PhonemeDialog.Content className="max-w-2xl max-h-[80vh] overflow-y-auto">
						<PhonemeDialog.Header phoneme={selectedPhoneme} />

						<div className="space-y-6 py-4">
							{selectedPhoneme.category === "consonant" ? (
								<PhonemeDialog.ConsonantArticulation phoneme={selectedPhoneme} />
							) : (
								<PhonemeDialog.VowelArticulation phoneme={selectedPhoneme} />
							)}

							<PhonemeDialog.Guide guide={selectedPhoneme.guide} />

							<PhonemeDialog.Examples examples={selectedPhoneme.examples} />

							{selectedPhoneme.allophones && selectedPhoneme.allophones.length > 0 && (
								<PhonemeDialog.Allophones allophones={selectedPhoneme.allophones} />
							)}
						</div>
					</PhonemeDialog.Content>
				</PhonemeDialog.Root>
			)}
		</div>
	);
}
