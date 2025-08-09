import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const { toPhonemic } = phonixUtils;

interface ConsonantCellProps {
	phonemes: ConsonantPhoneme[];
	onSelect: (p: ConsonantPhoneme) => void;
}

export const ConsonantCell: React.FC<ConsonantCellProps> = React.memo(function ConsonantCell({
	phonemes,
	onSelect,
}) {
	if (!phonemes.length) {
		return (
			<div className="flex h-14 items-center justify-center">
				<div className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden="true" />
			</div>
		);
	}
	return (
		<div className="flex h-14 items-center justify-center gap-1">
			{phonemes.map((p) => (
				<Tooltip key={p.symbol}>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => onSelect(p)}
							aria-label={`${toPhonemic(p.symbol)} ${p.articulation.voicing} ${p.articulation.place} ${p.articulation.manner}. Tap for details.`}
							className={
								"group relative inline-flex h-14 w-14 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
								(p.articulation.voicing === "voiceless" ? "border" : "bg-primary/10")
							}
						>
							<span className="pointer-events-none select-none text-xl sm:text-2xl leading-none">
								{p.symbol}
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" align="center">
						<div className="max-w-[14rem] text-pretty text-xs leading-snug">
							<div className="font-medium">
								{toPhonemic(p.symbol)} {p.description}
							</div>
							<div className="text-[10px] text-muted-foreground">Tap for details</div>
						</div>
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
});
