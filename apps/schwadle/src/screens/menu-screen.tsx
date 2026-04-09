import { Button } from "@phonaria/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@phonaria/ui/components/card";
import { Ear, EarOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Difficulty, useGameStore } from "@/store/game-store";

export function MenuScreen() {
	const startGame = useGameStore((s) => s.startGame);
	const [difficulty, setDifficulty] = useState<Difficulty>("easy");

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
			{/* Title */}
			<div className="animate-fade-in-down text-center">
				<h1 className="text-5xl font-bold tracking-tight">Schwadle</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Guess the GA pronunciation of English words
				</p>
			</div>

			{/* Difficulty selector */}
			<div
				className="grid w-full max-w-sm gap-3 animate-fade-in-up sm:grid-cols-2"
				style={{ animationDelay: "100ms" }}
			>
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

			{/* Play button */}
			<div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: "200ms" }}>
				<Button size="lg" className="w-full text-base" onClick={() => startGame(difficulty)}>
					Play
				</Button>
			</div>

			{/* Description */}
			<p
				className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground animate-fade-in"
				style={{ animationDelay: "400ms" }}
			>
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
			className={cn(
				"cursor-pointer transition-all duration-200",
				selected
					? "border-primary shadow-md ring-2 ring-primary/20"
					: "border-border hover:border-primary/40 hover:shadow-sm",
			)}
		>
			<CardHeader className="flex flex-row items-center gap-2 pb-1">
				<span
					className={cn("transition-colors", selected ? "text-primary" : "text-muted-foreground")}
				>
					{icon}
				</span>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}
