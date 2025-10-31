import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
	patterns: {
		pattern: string;
		description: string;
		examples: string[];
	}[];
};

export function PhonemeSpellingPatterns({ patterns }: Props) {
	return (
		<section className="space-y-2">
			<div className="flex items-center gap-1.5">
				<h3 className="text-xs font-semibold">Spelling Patterns</h3>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label="Learn more about spelling patterns"
						>
							<Info className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-64 text-sm">
						<p>
							Most English words use 'th' to represent this sound. Knowing these patterns helps you
							recognize and predict pronunciation when reading.
						</p>
					</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-2">
				{patterns.map((pattern) => (
					<div key={pattern.pattern} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
						<div className="flex items-center gap-1.5">
							<span className="inline-flex items-center justify-center rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
								{pattern.pattern}
							</span>
							<span className="text-xs text-muted-foreground">{pattern.description}</span>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{pattern.examples.map((example) => (
								<span
									key={example}
									className="inline-flex items-center rounded-md border bg-background px-2 py-0.5 text-xs font-medium"
								>
									{example}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
