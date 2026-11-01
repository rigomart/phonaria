import {
	Popover,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "@phonaria/ui/components/popover";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section ids on the Credits page, linked as `/credits#<key>`. */
export type CreditKey =
	| "cmu"
	| "wiktionary"
	| "jev"
	| "phoneme-audio"
	| "word-recordings"
	| "speech-scoring"
	| "wordfreq"
	| "ipa-chart"
	| "diagrams"
	| "phonetic-data";

const textLink =
	"rounded-sm underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** A visible one-line note on output that can be wrong, with a More button that opens the details. */
export function Disclaimer({
	children,
	title,
	points,
	sources = [],
	className,
}: {
	/** One plain sentence of inline content: the note renders as a `<p>`. */
	children: ReactNode;
	/** Heads the details, and names the More button for screen readers. */
	title: string;
	points: readonly ReactNode[];
	/** Where the data comes from, linked to its entry on the Credits page. */
	sources?: readonly { key: CreditKey; label: string }[];
	className?: string;
}) {
	return (
		<p className={cn("text-xs text-muted-foreground text-pretty", className)}>
			{children}{" "}
			<Popover>
				<PopoverTrigger aria-label={`More: ${title}`} className={cn("cursor-pointer", textLink)}>
					More
				</PopoverTrigger>
				<PopoverContent className="gap-3 sm:w-96">
					<PopoverTitle className="font-display text-sm font-semibold">{title}</PopoverTitle>
					<ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs text-muted-foreground sm:text-sm">
						{points.map((point, index) => (
							<li key={index}>{point}</li>
						))}
					</ul>
					{sources.length > 0 ? (
						<p className="text-xs text-muted-foreground">
							Sources:{" "}
							{sources.map((source, index) => (
								<span key={source.key}>
									{index > 0 ? ", " : null}
									<Link to="/credits" hash={source.key} className={textLink}>
										{source.label}
									</Link>
								</span>
							))}
						</p>
					) : null}
				</PopoverContent>
			</Popover>
		</p>
	);
}
