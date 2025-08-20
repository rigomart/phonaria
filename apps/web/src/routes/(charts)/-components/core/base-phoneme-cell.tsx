import * as React from "react";
import type { IpaPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PhonemeButton } from "@/routes/(charts)/-components/chart/phoneme-button";
import { ConsonantVoiceIndicator } from "./consonant-voice-indicator";

const { toPhonemic } = phonixUtils;

interface BasePhonemeCellProps<T extends IpaPhoneme> {
	phonemes: T[];
	onSelect: (phoneme: T) => void;
	getButtonClassName: (phoneme: T) => string;
	getAriaLabel: (phoneme: T) => string;
}

export const BasePhonemeCellRenderer = React.memo(function BasePhonemeCellRenderer<
	T extends IpaPhoneme,
>({ phonemes, onSelect, getButtonClassName, getAriaLabel }: BasePhonemeCellProps<T>) {
	if (!phonemes.length) {
		return (
			<div className="flex h-14 items-center justify-center">
				<div className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden="true" />
			</div>
		);
	}

	return (
		<div className="flex h-14 items-center justify-center gap-1">
			{phonemes.map((phoneme) => {
				const tooltipContent = `${toPhonemic(phoneme.symbol)} ${phoneme.description}`;

				return (
					<Tooltip key={phoneme.symbol}>
						<TooltipTrigger asChild>
							<PhonemeButton
								type="button"
								onClick={() => onSelect(phoneme)}
								aria-label={getAriaLabel(phoneme)}
								className={cn(getButtonClassName(phoneme))}
							>
								{phoneme.category === "consonant" && (
									<div className="absolute top-1 right-1 flex gap-0.5 pointer-events-none">
										<ConsonantVoiceIndicator type={phoneme.articulation.voicing} />
									</div>
								)}
								<span className="pointer-events-none select-none text-xl sm:text-2xl leading-none relative z-10">
									{phoneme.symbol}
								</span>
							</PhonemeButton>
						</TooltipTrigger>
						<TooltipContent side="top" align="center">
							<div className="max-w-[14rem] text-pretty text-xs leading-snug">
								<div className="font-medium">{tooltipContent}</div>
								<div className="text-[10px] text-muted-foreground">Tap for details</div>
							</div>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
}) as <T extends IpaPhoneme>(props: BasePhonemeCellProps<T>) => React.ReactElement;
