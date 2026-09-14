"use client";

import {
	isPhonemeInLanguage,
	type LanguagePhonemeId,
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
	const isKnown = Boolean(phoneme.phonemeId);

	if (!isKnown) {
		return (
			<span
				className="text-2xl md:text-4xl rounded-lg px-1.5 py-1 opacity-70 underline decoration-dotted underline-offset-4"
				title={`/${phoneme.symbol}/ - not found in phoneme database`}
			>
				{phoneme.symbol}
			</span>
		);
	}

	const phonemeId = phoneme.phonemeId;
	if (!phonemeId) return null;
	if (!isPhonemeInLanguage(targetAccent, phonemeId)) return null;

	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						type="button"
						className={cn(
							"text-2xl md:text-4xl rounded-lg px-1.5 py-1 cursor-pointer",
							"transition-colors duration-150",
							"hover:bg-primary/10 hover:text-primary",
							"data-popup-open:bg-primary/10 data-popup-open:text-primary",
						)}
						aria-label={`Details for /${phoneme.symbol}/`}
					/>
				}
			>
				{phoneme.symbol}
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
