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
				"text-3xl md:text-4xl bg-transparent border-none p-1 m-0 rounded-md",
				"cursor-pointer transition-all duration-100 ease-out",
				"hover:text-primary hover:bg-primary/5 hover:shadow-sm",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-md",
				!isKnown && "opacity-60 underline decoration-dotted underline-offset-4 hover:opacity-80",
				isSelected &&
					"text-primary bg-primary/10 underline underline-offset-4 ring-2 ring-primary/40 rounded-md shadow-sm",
			)}
			onClick={handleClick}
			aria-current={isSelected ? "true" : undefined}
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
