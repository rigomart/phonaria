import { useTranslations } from "next-intl";
import type { ConsonantPhoneme, IpaPhoneme, VowelPhoneme } from "shared-data";
import { phonariaUtils } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIpaChartStore } from "../_store/ipa-chart-store";

const { toPhonemic } = phonariaUtils;

interface PhonemeCardProps<T extends IpaPhoneme> {
	phoneme: T;
	className?: string;
}

export function PhonemeCard<T extends IpaPhoneme>({ phoneme, className }: PhonemeCardProps<T>) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const handleClick = () => selectPhoneme(phoneme);
	const t = useTranslations("IpaChart.Card");

	// Generate tooltip content
	const tooltipContent = `${toPhonemic(phoneme.symbol)} ${phoneme.description}`;
	const primaryExample = phoneme.examples[0];
	const ariaLabel = primaryExample ? `${phoneme.symbol} — ${primaryExample.word}` : phoneme.symbol;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleClick}
					aria-label={ariaLabel}
					className={cn(
						"group relative grid place-items-center text-center",
						"min-w-[3.25rem] min-h-[3.25rem] px-2 py-2 rounded-md border",
						"hover:border-primary hover:bg-primary/5 transition-all duration-150",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						"active:scale-[0.98]",
						getPhonemeCardVariant(phoneme),
						className,
					)}
				>
					{/* Main phoneme symbol */}
					<div className="text-lg sm:text-xl font-semibold leading-none tracking-tight">
						{phoneme.symbol}
					</div>
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" align="center">
				<div className="max-w-[14rem] text-pretty text-xs leading-snug">
					<div className="font-medium">{tooltipContent}</div>
					{primaryExample && (
						<div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
							{primaryExample.word}
						</div>
					)}
					<div className="text-[10px] text-muted-foreground mt-1">{t("tooltipHint")}</div>
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
