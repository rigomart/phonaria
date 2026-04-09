import { getIpaForPhonemeId, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { cmuVariantToIpa } from "@phonaria/phonetics-data/languages/en";
import { Button } from "@phonaria/ui/components/button";
import { Card, CardContent, CardHeader } from "@phonaria/ui/components/card";
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
			{/* Score header */}
			<div className="flex flex-col items-center gap-1 animate-count-pop">
				<p className="text-7xl font-bold tabular-nums tracking-tight">
					{score}
					<span className="text-3xl text-muted-foreground">/{totalRounds}</span>
				</p>
				<p className="text-sm text-muted-foreground">
					{score === totalRounds
						? "Perfect score!"
						: score >= 4
							? "Almost there!"
							: score >= 3
								? "Nice work!"
								: score >= 1
									? "Keep practicing!"
									: "Tough round!"}
				</p>
			</div>

			{/* Score bar visualization */}
			<div
				className="flex justify-center gap-1.5 animate-fade-in"
				style={{ animationDelay: "200ms" }}
			>
				{roundResults.map((r, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static result list
						key={i}
						className={`h-2 w-8 rounded-full transition-all ${
							r.answerResult.isCorrect ? "bg-green-500" : "bg-red-400"
						}`}
					/>
				))}
			</div>

			{/* Per-word breakdown */}
			<div className="flex flex-col gap-3">
				{roundResults.map((result, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: results are static after game ends
						key={index}
						className="animate-fade-in-up"
						style={{ animationDelay: `${300 + index * 100}ms` }}
					>
						<WordResult index={index} result={result} />
					</div>
				))}
			</div>

			<Button
				size="lg"
				className="mt-2 animate-fade-in-up"
				style={{ animationDelay: "800ms" }}
				onClick={resetGame}
			>
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
		<Card className={answerResult.isCorrect ? "border-green-500/30" : ""}>
			<CardHeader className="flex flex-row items-center gap-3 pb-2">
				<span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
					{index + 1}
				</span>
				<span className="text-lg font-bold">{word}</span>
				<span className="ml-auto">
					{answerResult.isCorrect ? (
						<span className="flex size-6 items-center justify-center rounded-full bg-green-500/15">
							<Check className="size-3.5 text-green-600" />
						</span>
					) : (
						<span className="flex size-6 items-center justify-center rounded-full bg-red-500/15">
							<X className="size-3.5 text-red-500" />
						</span>
					)}
				</span>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{/* Correct pronunciation */}
				<div>
					<p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						Correct
					</p>
					<p className="font-mono text-sm tracking-wide text-foreground/80">/{correctIpa}/</p>
				</div>

				{/* Your answer */}
				<div>
					<p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						Your answer
					</p>
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

				{/* Expected breakdown (only for wrong answers) */}
				{!answerResult.isCorrect && (
					<div>
						<p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Expected
						</p>
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
											className="inline-flex min-w-9 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 px-2 py-1.5 text-sm font-semibold text-green-700 dark:text-green-400"
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
