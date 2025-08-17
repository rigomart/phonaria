/**
 * Transcription Display Component
 * Shows phonemic transcription results with clickable phonemes
 */

import { Clock, FileText, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TranscribedPhoneme, TranscriptionResult } from "@/types/g2p";
import { PhonemeBadge } from "./phoneme-badge";

interface TranscriptionDisplayProps {
	result: TranscriptionResult;
	onPhonemeClick?: (phoneme: TranscribedPhoneme) => void;
	showMetadata?: boolean;
}

/**
 * Displays transcription results with clickable phonemes
 */
export function TranscriptionDisplay({
	result,
	onPhonemeClick,
	showMetadata = true,
}: TranscriptionDisplayProps) {
	const totalPhonemes = result.words.reduce((total, word) => total + word.phonemes.length, 0);
	const knownPhonemes = result.words.reduce(
		(total, word) => total + word.phonemes.filter((p) => p.isKnown).length,
		0,
	);

	return (
		<Card className="w-full">
			<CardHeader className="space-y-2">
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5 text-primary" />
					Phonemic Transcription
				</CardTitle>
				{showMetadata && (
					<CardDescription className="flex items-center gap-4 text-sm">
						<span className="flex items-center gap-1">
							<Hash className="h-3 w-3" />
							{result.words.length} word{result.words.length !== 1 ? "s" : ""}
						</span>
						<span className="flex items-center gap-1">
							<Hash className="h-3 w-3" />
							{totalPhonemes} phoneme{totalPhonemes !== 1 ? "s" : ""}
						</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{result.timestamp.toLocaleTimeString()}
						</span>
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Original text */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-muted-foreground">Original Text</h4>
					<p className="text-base p-3 bg-muted/30 rounded-md border">{result.originalText}</p>
				</div>

				{/* Transcription */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium text-muted-foreground">Phonemic Transcription</h4>
						{showMetadata && (
							<span className="text-xs text-muted-foreground">
								{knownPhonemes}/{totalPhonemes} phonemes recognized
							</span>
						)}
					</div>

					<div className="space-y-3 p-3 bg-muted/10 rounded-md border">
						{result.words.map((word, wordIndex) => (
							<div key={`${word.word}-${wordIndex}`} className="space-y-2">
								{/* Word */}
								<div className="flex items-baseline gap-2">
									<span className="text-sm font-medium text-muted-foreground">{word.word}</span>
									<span className="text-xs text-muted-foreground">
										({word.phonemes.length} phoneme{word.phonemes.length !== 1 ? "s" : ""})
									</span>
								</div>

								{/* Phonemes */}
								<div className="flex flex-wrap gap-2">
									{word.phonemes.map((phoneme, phonemeIndex) => (
										<PhonemeBadge
											key={`${phoneme.symbol}-${wordIndex}-${phonemeIndex}`}
											phoneme={phoneme}
											onClick={onPhonemeClick}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Instructions */}
				{onPhonemeClick && (
					<div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-300 dark:border-blue-700">
						💡 Click on any phoneme to learn about its articulation, see examples, and hear audio
						pronunciation.
						{knownPhonemes < totalPhonemes && (
							<span className="block mt-1">
								Dashed phonemes are not in our database but may still be valid IPA symbols.
							</span>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
