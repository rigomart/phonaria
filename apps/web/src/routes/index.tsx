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
		<div className="mx-auto max-w-4xl space-y-6 p-4">
			{/* Hero Section */}
			<div className="space-y-4 text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Phonemic Transcription Tool
				</h1>
				<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
					Convert English text into phonemic transcription using the International Phonetic Alphabet
					(IPA). Click on any phoneme to learn about its articulation and hear example
					pronunciations.
				</p>
			</div>

			<div className="mt-4 space-y-2">
				<h4 className="font-medium">Try these examples:</h4>
				<div className="flex flex-wrap gap-2">
					{["hello world", "pronunciation", "phonetics", "international"].map((example) => (
						<button
							key={example}
							type="button"
							onClick={() => g2p.transcribe(example)}
							className="rounded-md bg-primary/10 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
							disabled={g2p.state === "loading"}
						>
							"{example}"
						</button>
					))}
				</div>
			</div>

			{/* G2P Input Form */}
			<G2PInputForm
				onSubmit={g2p.transcribe}
				onClear={g2p.clear}
				state={g2p.state as "idle" | "loading" | "success" | "error"}
			/>

			{/* Error Display */}
			{g2p.state === "error" && g2p.error && (
				<div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
					<div className="flex items-start gap-3">
						<div className="text-sm text-destructive">
							<strong>Transcription Error:</strong> {g2p.error}
						</div>
					</div>
				</div>
			)}

			{/* Transcription Results */}
			{g2p.result && (
				<TranscriptionDisplay
					result={g2p.result}
					onPhonemeClick={handlePhonemeClick}
					showMetadata={true}
				/>
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
