import { cn } from "@/lib/utils";
import type { TranscribedPhoneme } from "../../_types/g2p";

interface ClickablePhonemeProps {
	phoneme: TranscribedPhoneme;
	onClick: (phoneme: TranscribedPhoneme) => void;
	selectedSymbol: string | null;
}

/**
 * Individual clickable phoneme with minimal styling
 */
export function ClickablePhoneme({ phoneme, onClick, selectedSymbol }: ClickablePhonemeProps) {
	const isKnown = Boolean(phoneme.phonemeId);
	const isSelected = selectedSymbol === phoneme.symbol;

	const handleClick = () => {
		onClick(phoneme);
	};

	return (
		<button
			type="button"
			className={cn(
				"text-2xl md:text-4xl rounded-lg border border-transparent px-1.5 py-1",
				"cursor-pointer transition-colors duration-150 ease-out",
				"hover:text-primary hover:border-primary/30 hover:bg-primary/5",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				!isKnown && "opacity-70 underline decoration-dotted underline-offset-4 hover:opacity-90",
				isSelected && "text-primary bg-primary/10 border-primary/50 shadow-sm",
			)}
			onClick={handleClick}
			aria-current={isSelected ? "true" : undefined}
			aria-pressed={isSelected}
			aria-label={`Phoneme ${phoneme.symbol}${isKnown ? " - click to learn more" : " - not in database"}`}
			title={
				isKnown
					? `Click to learn about /${phoneme.symbol}/`
					: `/${phoneme.symbol}/ - not found in phoneme database`
			}
		>
			{phoneme.symbol}
		</button>
	);
}
