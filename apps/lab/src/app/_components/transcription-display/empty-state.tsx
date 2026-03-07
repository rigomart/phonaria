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
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
			<div className="w-full max-w-md space-y-4 text-center">
				<p className="text-sm text-muted-foreground">Try an example</p>

				<div className="flex flex-wrap justify-center gap-2">
					{EXAMPLES.map((example) => (
						<button
							type="button"
							key={example}
							onClick={() => handleExampleClick(example)}
							disabled={transcribeMutation.isPending}
							className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
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
