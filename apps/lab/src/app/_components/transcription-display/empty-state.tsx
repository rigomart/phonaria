"use client";

import { ArrowRightIcon } from "lucide-react";
import { useTranscribe } from "../../_hooks/use-transcribe";

const EXAMPLES = ["Hello world", "Judge the rhythm", "She chose well", "Through thick fog"];

export function EmptyState() {
	const transcribeMutation = useTranscribe();

	const handleExampleClick = (example: string) => {
		transcribeMutation.mutate({ text: example });
	};

	return (
		<div className="flex flex-col items-center px-4 pt-6 pb-8 animate-in fade-in duration-700 delay-200 fill-mode-both">
			<div className="w-full max-w-md space-y-4 text-center">
				<p className="text-sm text-muted-foreground font-display">Try an example</p>

				<div className="flex flex-wrap justify-center gap-2">
					{EXAMPLES.map((example, i) => (
						<button
							type="button"
							key={example}
							onClick={() => handleExampleClick(example)}
							disabled={transcribeMutation.isPending}
							className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300"
							style={{ animationDelay: `${300 + i * 75}ms` }}
						>
							<span>{example}</span>
							<ArrowRightIcon className="size-3 opacity-50" />
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
