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
		<div className="flex flex-col items-center justify-center min-h-[400px] p-8">
			<div className="text-center space-y-8 max-w-lg w-full">
				{/* Visual Example */}
				<div className="space-y-4">
					<div className="inline-flex flex-col items-center gap-3 bg-muted/40 border border-border/60 rounded-lg px-6 py-5">
						<div className="flex items-center gap-2">
							<TypeIcon className="size-4 text-muted-foreground/40" />
							<div className="text-base text-muted-foreground font-normal">
								{t("visual-example.text")}
							</div>
						</div>
						<ChevronDownIcon className="size-4 text-muted-foreground/40" />
						<div className="flex items-center gap-2">
							<AudioWaveformIcon className="size-4 text-muted-foreground/40" />
							<div className="font-mono text-lg text-foreground tracking-wide">
								{t("visual-example.ipa")}
							</div>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">{t("description")}</p>
				</div>

				{/* Examples Grid */}
				<div className="space-y-3">
					<p className="text-sm font-medium text-muted-foreground">{t("try-example")}</p>
					<div className="grid grid-cols-2 gap-2">
						{examples.map((example) => (
							<Button
								key={example}
								type="button"
								onClick={() => handleExampleClick(example)}
								variant="outline"
								disabled={transcribeMutation.isPending}
								className="flex items-center justify-between gap-2"
							>
								<span className="text-xs font-normal text-muted-foreground">{example}</span>
								<ArrowRightIcon className="size-3 opacity-30" />
							</Button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
