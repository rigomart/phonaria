import { getIpaForPhonemeId, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { cmuVariantToIpa } from "@phonaria/phonetics-data/languages/en";
import { Button } from "@phonaria/ui/components/button";
import { Card, CardContent, CardHeader } from "@phonaria/ui/components/card";
import { Separator } from "@phonaria/ui/components/separator";
import { Check, RotateCcw, X } from "lucide-react";
import { PhonemeChip } from "@/components/phoneme-chip";
import type { PhonemeResult } from "@/lib/answer-checker";
import { useGameStore } from "@/store/game-store";

export function ResultsScreen() {
	const roundResults = useGameStore((s) => s.roundResults);
	const score = useGameStore((s) => s.score);
	const totalRounds = useGameStore((s) => s.totalRounds);
	const resetGame = useGameStore((s) => s.resetGame);

	return (
		<div className="flex flex-1 flex-col gap-6 px-4 py-8">
			<div className="text-center">
				<p className="text-6xl font-bold tabular-nums">
					{score}/{totalRounds}
				</p>
				<p className="mt-1 text-muted-foreground">
					{score === totalRounds ? "Perfect!" : score >= 3 ? "Nice work!" : "Keep practicing!"}
				</p>
			</div>

			<Separator />

			<div className="flex flex-col gap-4">
				{roundResults.map((result, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: results are static after game ends
					<WordResult key={index} index={index} result={result} />
				))}
			</div>

			<Button size="lg" className="mt-4" onClick={resetGame}>
				<RotateCcw className="size-4" />
				Play Again
			</Button>
		</div>
	);
}

function WordResult({
	index,
	result,
}: {
	index: number;
	result: {
		word: string;
		answerResult: {
			isCorrect: boolean;
			bestMatchVariant: string;
			phonemeResults: PhonemeResult[];
		};
	};
}) {
	const { word, answerResult } = result;
	const correctIpa = cmuVariantToIpa(answerResult.bestMatchVariant);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-3 pb-2">
				<span className="text-xs tabular-nums text-muted-foreground">#{index + 1}</span>
				<span className="text-lg font-bold">{word}</span>
				{answerResult.isCorrect ? (
					<Check className="ml-auto size-5 text-green-600" />
				) : (
					<X className="ml-auto size-5 text-red-500" />
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<div>
					<p className="mb-1 text-xs text-muted-foreground">Correct pronunciation</p>
					<p className="font-mono text-sm">/{correctIpa}/</p>
				</div>

				<div>
					<p className="mb-1 text-xs text-muted-foreground">Your answer</p>
					<div className="flex flex-wrap gap-1">
						{answerResult.phonemeResults.map((pr, i) => (
							<PhonemeChip
								key={`${pr.phonemeId}-${i}`}
								phonemeId={pr.phonemeId}
								status={pr.status}
							/>
						))}
					</div>
				</div>

				{!answerResult.isCorrect && (
					<div>
						<p className="mb-1 text-xs text-muted-foreground">Expected</p>
						<div className="flex flex-wrap gap-1">
							{answerResult.bestMatchVariant
								.split(" ")
								.filter((t) => t.length > 0)
								.map((token, i) => {
									const baseId = token.replace(/[012]$/, "") as PhonemeSymbolId;
									const ipa = getIpaForPhonemeId(baseId);
									return (
										<span
											// biome-ignore lint/suspicious/noArrayIndexKey: CMU tokens can repeat, index needed for uniqueness
											key={`${token}-${i}`}
											className="inline-flex min-w-8 items-center justify-center rounded-md border border-green-600/30 bg-green-500/10 px-1.5 py-1 text-sm font-medium text-green-700 dark:text-green-400"
										>
											{ipa}
										</span>
									);
								})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
