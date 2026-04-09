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
		<div className="flex flex-1 flex-col gap-4 px-4 py-6">
			<RoundProgress currentRound={currentRound} totalRounds={totalRounds} />

			<div className="flex flex-col items-center gap-2 py-4">
				<p className="text-4xl font-bold tracking-tight">{currentWord}</p>
				{isEasy && (
					<Badge variant="secondary">
						{syllableCount} {syllableCount === 1 ? "syllable" : "syllables"}
					</Badge>
				)}
			</div>

			<InputDisplay phonemes={currentInput} />

			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={removeLastPhoneme}
					disabled={currentInput.length === 0}
					aria-label="Remove last phoneme"
				>
					<Delete className="size-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={clearInput}
					disabled={currentInput.length === 0}
					aria-label="Clear all"
				>
					<RotateCcw className="size-4" />
				</Button>
				<Button
					size="sm"
					className="ml-auto"
					onClick={submitAnswer}
					disabled={currentInput.length === 0}
				>
					<SendHorizonal className="size-4" />
					Submit
				</Button>
			</div>

			<div className="mt-auto">
				<IpaKeyboard onSelectPhoneme={handleSelectPhoneme} audioEnabled={isEasy} />
			</div>
		</div>
	);
}
