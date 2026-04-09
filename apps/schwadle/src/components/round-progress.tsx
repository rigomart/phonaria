import { cn } from "@/lib/utils";

type RoundProgressProps = {
	currentRound: number;
	totalRounds: number;
};

export function RoundProgress({ currentRound, totalRounds }: RoundProgressProps) {
	return (
		<div className="flex items-center gap-1.5">
			{Array.from({ length: totalRounds }, (_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length progress indicators never reorder
					key={i}
					className={cn(
						"h-1.5 flex-1 rounded-full transition-colors",
						i < currentRound ? "bg-primary" : i === currentRound ? "bg-primary/50" : "bg-muted",
					)}
				/>
			))}
			<span className="ml-2 text-xs tabular-nums text-muted-foreground">
				{currentRound + 1}/{totalRounds}
			</span>
		</div>
	);
}
