import type * as React from "react";
import { vowelFrontnesses, vowelHeights } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AxisEntry {
	key: string;
	label: string;
	short: string;
}

function findVowelAxisInfo(type: "height" | "frontness", key: string): AxisEntry | undefined {
	const source = type === "height" ? vowelHeights : vowelFrontnesses;
	return source.find((i) => i.key === key);
}

interface VowelAxisInfoPopoverProps {
	type: "height" | "frontness";
	id: string; // key like "high", "front", etc.
	children: React.ReactNode;
}

/**
 * Tooltip micro-help for vowel axis labels (height / frontness).
 */
export function VowelAxisInfoPopover({ type, id, children }: VowelAxisInfoPopoverProps) {
	const info = findVowelAxisInfo(type, id);
	if (!info) return <>{children}</>;
	return (
		<Tooltip delayDuration={150}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent
				side={type === "frontness" ? "top" : "right"}
				align="center"
				className="max-w-xs text-xs leading-snug"
			>
				<div className="space-y-1">
					<div className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
						{type === "height" ? "Height" : "Frontness"}
					</div>
					<div className="font-semibold text-sm">{info.label}</div>
					<p className="text-muted-foreground">{info.short}</p>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
