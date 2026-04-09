import { Badge } from "@phonaria/ui/components/badge";
import { Button } from "@phonaria/ui/components/button";
import { Delete, RotateCcw, SendHorizonal } from "lucide-react";
import { InputDisplay } from "@/components/input-display";
import { IpaKeyboard } from "@/components/ipa-keyboard/ipa-keyboard";
import { RoundProgress } from "@/components/round-progress";
import type { KeyboardPhoneme } from "@/lib/keyboard-layout";
import { getMinSyllableCount } from "@/lib/syllable-count";
import { useGameStore } from "@/store/game-store";

export function PlayingScreen() {
	const currentRound = useGameStore((s) => s.currentRound);
	const totalRounds = useGameStore((s) => s.totalRounds);
	const words = useGameStore((s) => s.words);
	const wordVariants = useGameStore((s) => s.wordVariants);
	const currentInput = useGameStore((s) => s.currentInput);
	const difficulty = useGameStore((s) => s.difficulty);
	const addPhoneme = useGameStore((s) => s.addPhoneme);
	const removeLastPhoneme = useGameStore((s) => s.removeLastPhoneme);
	const removePhonemeAtIndex = useGameStore((s) => s.removePhonemeAtIndex);
	const clearInput = useGameStore((s) => s.clearInput);
	const submitAnswer = useGameStore((s) => s.submitAnswer);

	const currentWord = words[currentRound];
	const variants = wordVariants[currentWord];
	const syllableCount = getMinSyllableCount(variants);
	const isEasy = difficulty === "easy";

	function handleSelectPhoneme(phoneme: KeyboardPhoneme) {
		addPhoneme(phoneme.id);
	}

	return (
		<div className="flex flex-1 flex-col px-4 py-4">
			{/* Progress */}
			<div className="animate-fade-in">
				<RoundProgress currentRound={currentRound} totalRounds={totalRounds} />
			</div>

			{/* Center section: word + input + controls */}
			<div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
				{/* Word display */}
				<div key={currentWord} className="animate-fade-in-down flex flex-col items-center gap-2">
					<p className="text-4xl font-bold tracking-tight">{currentWord}</p>
					{isEasy && (
						<Badge variant="secondary" className="animate-scale-in">
							{syllableCount} {syllableCount === 1 ? "syllable" : "syllables"}
						</Badge>
					)}
				</div>

				{/* Input area — z-20 so the search dropdown floats above controls and keyboard */}
				<div className="relative z-20 w-full animate-fade-in" style={{ animationDelay: "100ms" }}>
					<InputDisplay
						phonemes={currentInput}
						onRemove={removePhonemeAtIndex}
						onAdd={addPhoneme}
						onRemoveLast={removeLastPhoneme}
					/>
				</div>

				{/* Controls */}
				<div
					className="flex w-full items-center gap-2 animate-fade-in"
					style={{ animationDelay: "150ms" }}
				>
					<Button
						variant="outline"
						onClick={removeLastPhoneme}
						disabled={currentInput.length === 0}
						aria-label="Remove last phoneme"
					>
						<Delete className="size-4" />
					</Button>
					<Button
						variant="outline"
						onClick={clearInput}
						disabled={currentInput.length === 0}
						aria-label="Clear all"
					>
						<RotateCcw className="size-4" />
					</Button>
					<Button className="ml-auto" onClick={submitAnswer} disabled={currentInput.length === 0}>
						<SendHorizonal className="size-4" />
						Guess
					</Button>
				</div>
			</div>

			{/* Keyboard — anchored to bottom */}
			<div className="animate-slide-up-keyboard rounded-xl border bg-muted/30 p-3">
				<IpaKeyboard onSelectPhoneme={handleSelectPhoneme} audioEnabled={isEasy} />
			</div>
		</div>
	);
}
