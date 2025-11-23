export function TranscriptionPreview() {
	return (
		<div className="rounded-lg border border-border/40 bg-background-soft/50 p-3 space-y-2">
			{/* Example Input */}
			<div className="text-xs text-muted-foreground">hello</div>
			{/* Example Output */}
			<div className="flex gap-1">
				{["h", "ə", "ˈ", "l", "oʊ"].map((symbol, i) => (
					<div
						key={i}
						className="px-1.5 py-0.5 rounded bg-background/60 border border-border/40 text-sm font-mono text-foreground/80"
					>
						{symbol}
					</div>
				))}
			</div>
		</div>
	);
}
