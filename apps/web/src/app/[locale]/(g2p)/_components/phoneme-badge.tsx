import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TranscribedPhoneme } from "../_types/g2p";

interface PhonemeBadgeProps {
	phoneme: TranscribedPhoneme;
	onClick?: (phoneme: TranscribedPhoneme) => void;
	variant?: "default" | "secondary" | "destructive" | "outline";
	className?: string;
	disabled?: boolean;
}

/**
 * Clickable phoneme badge component
 */
export function PhonemeBadge({
	phoneme,
	onClick,
	variant,
	className,
	disabled = false,
}: PhonemeBadgeProps) {
	const isClickable = !!onClick && !disabled;
	const isKnown = phoneme.isKnown;

	// Determine badge variant based on phoneme status
	const badgeVariant = variant || (isKnown ? "default" : "outline");

	const handleClick = () => {
		if (isClickable) {
			onClick(phoneme);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (isClickable && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			onClick(phoneme);
		}
	};

	return (
		<Badge
			variant={badgeVariant}
			className={cn(
				"font-mono text-sm",
				isClickable && [
					"cursor-pointer transition-all duration-200",
					"hover:scale-105 hover:shadow-sm",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				],
				!isKnown && "border-dashed opacity-75",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			onClick={isClickable ? handleClick : undefined}
			onKeyDown={isClickable ? handleKeyDown : undefined}
			tabIndex={isClickable ? 0 : undefined}
			role={isClickable ? "button" : undefined}
			aria-label={
				isClickable
					? `Phoneme ${phoneme.symbol}${isKnown ? " - click to learn more" : " - not in database"}`
					: `Phoneme ${phoneme.symbol}`
			}
			title={
				isKnown
					? `Click to learn about /${phoneme.symbol}/`
					: `/${phoneme.symbol}/ - not found in phoneme database`
			}
		>
			{phoneme.symbol}
		</Badge>
	);
}
