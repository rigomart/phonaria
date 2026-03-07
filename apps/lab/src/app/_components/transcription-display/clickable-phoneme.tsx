import type { TranscribedPhoneme } from "@/lib/types/g2p";
import { cn } from "@/lib/utils";

interface ClickablePhonemeProps {
	phoneme: TranscribedPhoneme;
}

export function ClickablePhoneme({ phoneme }: ClickablePhonemeProps) {
	const isKnown = Boolean(phoneme.phonemeId);

	return (
		<span
			className={cn(
				"text-2xl md:text-4xl rounded-lg px-1.5 py-1",
				!isKnown && "opacity-70 underline decoration-dotted underline-offset-4",
			)}
			title={
				isKnown ? `/${phoneme.symbol}/` : `/${phoneme.symbol}/ - not found in phoneme database`
			}
		>
			{phoneme.symbol}
		</span>
	);
}
