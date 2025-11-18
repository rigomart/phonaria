"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ChartInfoButtonProps = {
	content: string;
	ariaLabel?: string;
};

export function ChartInfoButton({
	content,
	ariaLabel = "Chart information",
}: ChartInfoButtonProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground z-10"
					aria-label={ariaLabel}
				>
					<Info className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80">
				<p className="text-sm text-foreground leading-relaxed">{content}</p>
			</PopoverContent>
		</Popover>
	);
}
