import { Button } from "@phonaria/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@phonaria/ui/components/card";
import { Ear, EarOff } from "lucide-react";
import { useState } from "react";
import { type Difficulty, useGameStore } from "@/store/game-store";

export function MenuScreen() {
	const startGame = useGameStore((s) => s.startGame);
	const [difficulty, setDifficulty] = useState<Difficulty>("easy");

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
			<div className="text-center">
				<h1 className="text-5xl font-bold tracking-tight">Schwadle</h1>
				<p className="mt-2 text-muted-foreground">Guess the GA pronunciation of English words</p>
			</div>

			<div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
				<DifficultyCard
					title="Easy"
					description="Phoneme audio and syllable hints"
					icon={<Ear className="size-5" />}
					selected={difficulty === "easy"}
					onClick={() => setDifficulty("easy")}
				/>
				<DifficultyCard
					title="Hard"
					description="No aids — just you and the keyboard"
					icon={<EarOff className="size-5" />}
					selected={difficulty === "hard"}
					onClick={() => setDifficulty("hard")}
				/>
			</div>

			<Button size="lg" className="w-full max-w-md" onClick={() => startGame(difficulty)}>
				Play
			</Button>

			<p className="max-w-sm text-center text-xs text-muted-foreground">
				5 rounds per game. Build each word's IPA transcription using the phoneme keyboard. Score
				revealed at the end.
			</p>
		</div>
	);
}

function DifficultyCard({
	title,
	description,
	icon,
	selected,
	onClick,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<Card
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			className={`cursor-pointer transition-all ${
				selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
			}`}
		>
			<CardHeader className="flex flex-row items-center gap-2 pb-1">
				{icon}
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}
