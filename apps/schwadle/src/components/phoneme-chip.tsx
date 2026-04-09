import { getIpaForPhonemeId, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { cn } from "@/lib/utils";
import { PhonemePopoverContent } from "./phoneme-popover-content";

type PhonemeChipProps = {
	phonemeId: PhonemeSymbolId;
	status?: "correct" | "wrong" | "missing" | "extra" | "neutral";
	/** When provided, clicking triggers this callback instead of opening a popover. */
	onClick?: () => void;
};

const statusStyles: Record<NonNullable<PhonemeChipProps["status"]>, string> = {
	neutral: "border-border bg-card text-foreground shadow-sm",
	correct:
		"border-green-500/50 bg-green-500/15 text-green-700 dark:border-green-500/30 dark:text-green-400",
	wrong: "border-red-500/50 bg-red-500/15 text-red-700 dark:border-red-500/30 dark:text-red-400",
	missing:
		"border-muted-foreground/30 bg-muted/40 text-muted-foreground/60 line-through decoration-2",
	extra:
		"border-orange-500/50 bg-orange-500/15 text-orange-700 dark:border-orange-500/30 dark:text-orange-400",
};

const chipClassName =
	"inline-flex min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 py-1.5 text-sm font-semibold transition-all duration-150 hover:brightness-95 active:scale-95";

export function PhonemeChip({ phonemeId, status = "neutral", onClick }: PhonemeChipProps) {
	const ipa = getIpaForPhonemeId(phonemeId);

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className={cn(chipClassName, statusStyles[status])}>
				{ipa}
			</button>
		);
	}

	return (
		<Popover>
			<PopoverTrigger className={cn(chipClassName, statusStyles[status])}>{ipa}</PopoverTrigger>
			<PopoverContent className="w-auto p-3">
				<PhonemePopoverContent phonemeId={phonemeId} />
			</PopoverContent>
		</Popover>
	);
}
