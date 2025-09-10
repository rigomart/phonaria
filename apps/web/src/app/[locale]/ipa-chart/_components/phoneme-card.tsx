import type { ConsonantPhoneme, IpaPhoneme, VowelPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const { toPhonemic } = phonixUtils;

interface PhonemeCardProps<T extends IpaPhoneme> {
	phoneme: T;
	onClick: (phoneme: T) => void;
	className?: string;
}

/**
 * Unified phoneme card component that replaces ConsonantCell, VowelCell, and BasePhonemeCellRenderer.
 * Provides visual indicators for different phoneme types and consistent interaction patterns.
 */
export function PhonemeCard<T extends IpaPhoneme>({
	phoneme,
	onClick,
	className,
}: PhonemeCardProps<T>) {
	const handleClick = () => onClick(phoneme);

	// Generate aria label for accessibility
	const ariaLabel = generateAriaLabel(phoneme);

	// Generate tooltip content
	const tooltipContent = `${toPhonemic(phoneme.symbol)} ${phoneme.description}`;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleClick}
					aria-label={ariaLabel}
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
					{/* Visual indicators for phoneme type */}
					{renderPhonemeIndicators(phoneme)}

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
 * Generate accessible aria label for phoneme
 */
function generateAriaLabel<T extends IpaPhoneme>(phoneme: T): string {
	const symbol = toPhonemic(phoneme.symbol);
	const exampleWord = phoneme.examples[0]?.word;

	if (phoneme.category === "consonant") {
		const consonant = phoneme as ConsonantPhoneme;
		return `${symbol} ${consonant.articulation.voicing} ${consonant.articulation.place} ${consonant.articulation.manner}${exampleWord ? `, as in ${exampleWord}` : ""}. Click for details.`;
	} else {
		const vowel = phoneme as VowelPhoneme;
		const rhotic = vowel.articulation.rhoticity === "rhotic" || vowel.type === "rhotic";
		let label = `${symbol} ${vowel.articulation.height} ${vowel.articulation.frontness} ${vowel.articulation.tenseness} ${vowel.articulation.roundness}`;
		if (rhotic) label += " rhotic";
		if (exampleWord) label += `, as in ${exampleWord}`;
		label += ". Click for details.";
		return label;
	}
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
			return "bg-secondary/10 border-secondary/30 rounded-full";
		} else {
			return "bg-background border-border";
		}
	}
}

/**
 * Render visual indicators for phoneme characteristics
 */
function renderPhonemeIndicators<T extends IpaPhoneme>(phoneme: T) {
	if (phoneme.category === "consonant") {
		const consonant = phoneme as ConsonantPhoneme;
		return (
			<div className="absolute top-1 right-1 flex gap-0.5 pointer-events-none">
				<Badge
					variant={consonant.articulation.voicing === "voiced" ? "default" : "secondary"}
					className="h-2 w-2 p-0 rounded-full"
				/>
			</div>
		);
	} else {
		const vowel = phoneme as VowelPhoneme;
		const isRhotic = vowel.articulation.rhoticity === "rhotic" || vowel.type === "rhotic";

		if (isRhotic) {
			return (
				<div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none">
					<div className="h-0.5 w-5 rounded-full bg-accent/60" />
				</div>
			);
		}
	}

	return null;
}
