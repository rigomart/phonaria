import type { ConsonantSymbolId } from "shared-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import type { MannerOfArticulation, PlaceOfArticulation, Voicing } from "../_lib/consonant-grid";
import { useIpaChartStore } from "../_store/ipa-chart-store";

interface ConsonantPhoneme {
	id: ConsonantSymbolId;
	symbol: string;
	voicing: Voicing;
	manner: MannerOfArticulation;
	place: PlaceOfArticulation;
}

interface ConsonantPairCardProps {
	voiceless?: ConsonantPhoneme;
	voiced?: ConsonantPhoneme;
	className?: string;
}

export function ConsonantPairCard({ voiceless, voiced, className }: ConsonantPairCardProps) {
	if (!voiceless && !voiced) {
		return null;
	}

	if (!voiceless || !voiced) {
		const phoneme = voiceless ?? voiced;
		if (!phoneme) return null;
		return <SingleConsonantCard phoneme={phoneme} className={className} />;
	}

	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			<ConsonantButton phoneme={voiceless} isVoiceless />
			<ConsonantButton phoneme={voiced} isVoiceless={false} />
		</div>
	);
}

function SingleConsonantCard({
	phoneme,
	className,
}: {
	phoneme: ConsonantPhoneme;
	className?: string;
}) {
	const isVoiceless = phoneme.voicing === "voiceless";

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<ConsonantButton phoneme={phoneme} isVoiceless={isVoiceless} />
		</div>
	);
}

function ConsonantButton({
	phoneme,
	isVoiceless,
}: {
	phoneme: ConsonantPhoneme;
	isVoiceless: boolean;
}) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);
	const t = useScopedI18n("ipa-chart.card");
	const handleClick = () => {
		selectPhoneme(phoneme.id);
	};
	const tooltipContent = `/${phoneme.symbol}/ - ${phoneme.voicing} ${phoneme.place} ${phoneme.manner}`;
	const ariaLabel = `${phoneme.symbol}`;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={handleClick}
					aria-label={ariaLabel}
					className={cn(
						"group relative grid place-items-center text-center",
						"min-w-[2.5rem] min-h-[2.5rem] px-2 py-1.5 rounded-md border",
						"hover:border-primary hover:bg-primary/5 transition-all duration-150",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						"active:scale-[0.98]",
						isVoiceless
							? "bg-background border-border opacity-80 hover:opacity-100"
							: "bg-primary/5 border-primary/20 font-semibold",
					)}
				>
					<div className="text-base sm:text-lg font-medium leading-none tracking-tight">
						{phoneme.symbol}
					</div>
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" align="center">
				<div className="max-w-[14rem] text-pretty text-xs leading-snug">
					<div className="font-medium">{tooltipContent}</div>
					<div className="text-[10px] text-muted-foreground mt-1">{t("tooltip-hint")}</div>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
