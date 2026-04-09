import { getIpaForPhonemeId, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { cn } from "@/lib/utils";
import { PhonemePopoverContent } from "./phoneme-popover-content";

type PhonemeChipProps = {
	phonemeId: PhonemeSymbolId;
	status?: "correct" | "wrong" | "missing" | "extra" | "neutral";
};

const statusStyles: Record<NonNullable<PhonemeChipProps["status"]>, string> = {
	neutral: "border-border bg-card text-foreground",
	correct: "border-green-600 bg-green-500/15 text-green-700 dark:text-green-400",
	wrong: "border-red-600 bg-red-500/15 text-red-700 dark:text-red-400",
	missing: "border-muted-foreground/40 bg-muted/50 text-muted-foreground line-through",
	extra: "border-orange-600 bg-orange-500/15 text-orange-700 dark:text-orange-400",
};

export function PhonemeChip({ phonemeId, status = "neutral" }: PhonemeChipProps) {
	const ipa = getIpaForPhonemeId(phonemeId);

	return (
		<Popover>
			<PopoverTrigger
				className={cn(
					"inline-flex min-w-8 items-center justify-center rounded-md border px-1.5 py-1 text-sm font-medium transition-colors hover:opacity-80",
					statusStyles[status],
				)}
			>
				{ipa}
			</PopoverTrigger>
			<PopoverContent className="w-auto p-3">
				<PhonemePopoverContent phonemeId={phonemeId} />
			</PopoverContent>
		</Popover>
	);
}
