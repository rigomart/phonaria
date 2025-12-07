"use client";

import { ArrowRightIcon, AudioWaveformIcon, ChevronDownIcon, TypeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScopedI18n } from "@/locales/client";
import { useTranscribe } from "../../_hooks/use-g2p";

export function EmptyState() {
	const transcribeMutation = useTranscribe();
	const t = useScopedI18n("g2p-page.empty-state");

	const examples = [t(`examples.0`), t(`examples.1`), t(`examples.2`), t(`examples.3`)];

	const handleExampleClick = (example: string) => {
		transcribeMutation.mutate(example);
	};

	return (
		<div className="flex min-h-[420px] items-center justify-center bg-background px-6 py-10">
			<div className="w-full max-w-2xl space-y-8 rounded-xl border border-dashed border-border/70 bg-background-soft px-6 py-7 text-center shadow-sm">
				<div className="flex flex-col items-center gap-3">
					<div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground/90 ring-1 ring-border/80">
						<TypeIcon className="size-3.5 text-muted-foreground/60" />
						<span>{t("description")}</span>
					</div>
					<div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-5 py-3 shadow-inner shadow-black/5">
						<div className="text-sm font-medium text-muted-foreground">
							{t("visual-example.text")}
						</div>
						<ChevronDownIcon className="size-4 text-muted-foreground/40" />
						<div className="flex items-center gap-2 text-lg tracking-wide">
							<AudioWaveformIcon className="size-4 text-muted-foreground/40" />
							<span className="font-semibold text-foreground">{t("visual-example.ipa")}</span>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">{t("try-example")}</p>
				</div>

				<div className="grid gap-2 sm:grid-cols-2">
					{examples.map((example) => (
						<Button
							key={example}
							type="button"
							onClick={() => handleExampleClick(example)}
							variant="outline"
							disabled={transcribeMutation.isPending}
							className="flex items-center justify-between gap-2 bg-background text-left text-sm font-medium"
						>
							<span className="truncate text-muted-foreground">{example}</span>
							<ArrowRightIcon className="size-3.5 text-muted-foreground/50" />
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
