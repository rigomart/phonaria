import { Button } from "@phonaria/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@phonaria/ui/components/popover";
import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";

export function VowelChartGuide({ showGlide }: { showGlide: boolean }) {
	return (
		<Popover>
			<PopoverTrigger
				render={<Button variant="outline" size="icon-sm" aria-label="How to read this chart" />}
			>
				<CircleHelp />
			</PopoverTrigger>
			<PopoverContent align="end" className="max-h-(--available-height) w-64 overflow-y-auto">
				<PopoverHeader>
					<PopoverTitle className="font-display font-semibold">Reading the chart</PopoverTitle>
					<PopoverDescription className="text-xs">
						Each vowel sits where your tongue is when you say it. Picture a side view of the mouth:
						lips on the left, throat on the right, roof of the mouth at the top.
					</PopoverDescription>
				</PopoverHeader>
				<dl className="space-y-1.5 text-xs">
					<GuideItem term="Up–down">Tongue high → low</GuideItem>
					<GuideItem term="Left–right">Tongue front → back</GuideItem>
					<GuideItem term="Filled">Rounded lips</GuideItem>
					<GuideItem term="Dashed">R-colored</GuideItem>
					{showGlide && <GuideItem term="Arrows">Glide start → end</GuideItem>}
				</dl>
			</PopoverContent>
		</Popover>
	);
}

function GuideItem({ term, children }: { term: string; children: ReactNode }) {
	return (
		<div className="flex gap-2">
			<dt className="w-16 shrink-0 font-semibold">{term}</dt>
			<dd className="text-muted-foreground">{children}</dd>
		</div>
	);
}
