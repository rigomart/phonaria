import { Waves } from "lucide-react";

export function G2PPreview() {
	const phonemes = ["ð", "ə", "ˈ", "θ", "ɔ", "t", "f", "əl", "|", "ˈ", "l", "ɝ", "n", "ɚ"];

	return (
		<div className="space-y-3">
			<div className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs">
				<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Input text
				</p>
				<p className="text-sm font-medium text-foreground">thoughtful learner</p>
			</div>
			<div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-3 shadow-inner">
				<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
					IPA transcription
				</p>
				<div className="mt-2 flex flex-wrap gap-1.5 text-base font-semibold text-primary">
					{phonemes.map((symbol, index) => (
						<span
							key={`phoneme-${index}-${symbol}`}
							className="rounded-lg border border-primary/30 bg-background/90 px-2 py-1 text-primary shadow-sm"
						>
							{symbol}
						</span>
					))}
				</div>
			</div>
			<div className="flex items-center gap-2 text-xs font-medium text-primary">
				<Waves className="size-4" aria-hidden="true" />
				Tap any phoneme to open detailed articulation insights
			</div>
		</div>
	);
}
