import { cn } from "@/lib/utils";

type RoundProgressProps = {
	currentRound: number;
	totalRounds: number;
};

export function RoundProgress({ currentRound, totalRounds }: RoundProgressProps) {
	return (
		<div className="flex items-center gap-2">
			<div className="flex flex-1 items-center gap-1.5">
				{Array.from({ length: totalRounds }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length progress indicators never reorder
						key={i}
						className={cn(
							"h-2 flex-1 rounded-full transition-all duration-300",
							i < currentRound
								? "bg-primary"
								: i === currentRound
									? "bg-primary/40 animate-pulse"
									: "bg-muted",
						)}
					/>
				))}
			</div>
			<span className="text-xs font-medium tabular-nums text-muted-foreground">
				{currentRound + 1} of {totalRounds}
			</span>
		</div>
	);
}
