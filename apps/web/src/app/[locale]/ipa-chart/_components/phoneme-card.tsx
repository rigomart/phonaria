import type { ConsonantPhoneme, IpaPhoneme, VowelPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const { toPhonemic } = phonixUtils;

interface PhonemeCardProps<T extends IpaPhoneme> {
	phoneme: T;
	onClick: (phoneme: T) => void;
	className?: string;
}

export function PhonemeCard<T extends IpaPhoneme>({
	phoneme,
	onClick,
	className,
}: PhonemeCardProps<T>) {
	const handleClick = () => onClick(phoneme);

	// Generate tooltip content
	const tooltipContent = `${toPhonemic(phoneme.symbol)} ${phoneme.description}`;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleClick}
					aria-label={phoneme.symbol}
					className={cn(
						"group relative flex flex-col items-center justify-center",
						"min-w-[4.5rem] min-h-[4.5rem] p-3 rounded-lg border",
						"hover:border-primary hover:shadow-sm transition-all duration-200",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						"active:scale-95",
						getPhonemeCardVariant(phoneme),
						className,
					)}
				>
					{/* Main phoneme symbol */}
					<div className="text-xl sm:text-2xl font-semibold leading-none mb-1 relative z-10">
						{phoneme.symbol}
					</div>

					{/* Example word */}
					<div className="text-xs text-center text-muted-foreground leading-tight">
						{phoneme.examples[0]?.word || ""}
					</div>
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" align="center">
				<div className="max-w-[14rem] text-pretty text-xs leading-snug">
					<div className="font-medium">{tooltipContent}</div>
					<div className="text-[10px] text-muted-foreground mt-1">
						Click for articulation details
					</div>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}

/**
 * Get variant styling for different phoneme types
 */
function getPhonemeCardVariant<T extends IpaPhoneme>(phoneme: T): string {
	if (phoneme.category === "consonant") {
		const consonant = phoneme as ConsonantPhoneme;
		return consonant.articulation.voicing === "voiced"
			? "bg-primary/5 border-primary/20"
			: "bg-background border-border";
	} else {
		const vowel = phoneme as VowelPhoneme;
		const isRounded = vowel.articulation.roundness === "rounded";
		const isRhotic = vowel.articulation.rhoticity === "rhotic" || vowel.type === "rhotic";

		if (isRhotic) {
			return "bg-accent/10 border-accent/30";
		} else if (isRounded) {
			return "bg-secondary/50 border-secondary/70 rounded-full";
		} else {
			return "bg-background border-border";
		}
	}
}
