"use client";

import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTranscribe } from "../../_hooks/use-g2p";

export function EmptyState() {
	const transcribeMutation = useTranscribe();
	const t = useTranslations("g2p-page.empty-state");

	const examples = [t(`examples.0`), t(`examples.1`), t(`examples.2`), t(`examples.3`)];

	const handleExampleClick = (example: string) => {
		transcribeMutation.mutate({ text: example });
	};

	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
			<div className="w-full max-w-md space-y-4 text-center">
				<p className="text-sm text-muted-foreground">{t("try-example")}</p>

				<div className="flex flex-wrap justify-center gap-2">
					{examples.map((example) => (
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
