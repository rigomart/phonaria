"use client";

import {
	isPhonemeInLanguage,
	type LanguagePhonemeId,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import type { TranscribedPhoneme } from "@/lib/types/g2p";
import { cn } from "@/lib/utils";

interface ClickablePhonemeProps {
	targetAccent: TargetAccent;
	phoneme: TranscribedPhoneme;
}

export function ClickablePhoneme({ targetAccent, phoneme }: ClickablePhonemeProps) {
	if (!phoneme.phonemeId) {
		return (
			<span
				className="text-2xl md:text-4xl rounded-lg px-1.5 py-1 opacity-70 underline decoration-dotted underline-offset-4"
				title={`/${phoneme.symbol}/ - not found in phoneme database`}
			>
				{phoneme.symbol}
			</span>
		);
	}

	return (
		<PhonemePopoverButton
			targetAccent={targetAccent}
			phonemeId={phoneme.phonemeId}
			symbol={phoneme.symbol}
			className="text-2xl md:text-4xl"
		/>
	);
}

export function PhonemePopoverButton({
	targetAccent,
	phonemeId,
	symbol,
	className,
}: {
	targetAccent: TargetAccent;
	phonemeId: PhonemeSymbolId;
	symbol: string;
	className?: string;
}) {
	if (!isPhonemeInLanguage(targetAccent, phonemeId)) return null;

	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						type="button"
						className={cn(
							"rounded-lg px-1.5 py-1 cursor-pointer",
							"transition-colors duration-150",
							"hover:bg-primary/10 hover:text-primary",
							"data-popup-open:bg-primary/10 data-popup-open:text-primary",
							className,
						)}
						aria-label={`Details for /${symbol}/`}
					/>
				}
			>
				{symbol}
			</PopoverTrigger>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent
					targetAccent={targetAccent}
					phonemeId={phonemeId as LanguagePhonemeId<typeof targetAccent>}
				/>
			</PopoverContent>
		</Popover>
	);
}
