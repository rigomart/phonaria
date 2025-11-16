export function G2PPreview() {
	const phonemes = ["ð", "ə", "ˈ", "θ", "ɔ", "t", "f", "ə", "l", "|", "ˈ", "l", "ɝ", "n", "ɚ"];

	return (
		<div className="rounded-lg border border-border bg-card">
			<div className="border-b border-border bg-muted/30 px-4 py-3">
				<p className="text-xs font-medium text-muted-foreground">Input</p>
				<p className="mt-1 text-sm text-foreground">thoughtful learner</p>
			</div>
			<div className="p-4">
				<p className="text-xs font-medium text-muted-foreground mb-3">IPA transcription</p>
				<div className="flex flex-wrap gap-1.5">
					{phonemes.map((symbol, index) => (
						<span
							key={`phoneme-${index}-${symbol}`}
							className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded border border-border bg-background text-sm font-mono hover:bg-accent hover:border-primary/50 cursor-pointer transition-colors"
						>
							{symbol}
						</span>
					))}
				</div>
				<p className="mt-4 text-xs text-muted-foreground">
					Click any phoneme to see articulation details
				</p>
			</div>
		</div>
	);
}
