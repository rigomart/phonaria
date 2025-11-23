export function IpaChartPreview() {
	const consonants = ["p", "b", "t", "d", "k", "ɡ"];
	const vowels = ["i", "ɪ", "ɛ", "æ", "ɑ", "ɔ", "ʊ", "u"];

	return (
		<div className="rounded-lg border border-border/40 bg-background-soft/50 p-3 space-y-2">
			{/* Consonants Row */}
			<div className="flex flex-wrap gap-1">
				{consonants.map((symbol, i) => (
					<div
						key={i}
						className="w-7 h-7 flex items-center justify-center rounded bg-background/60 border border-border/40 text-sm font-mono text-foreground/80"
					>
						{symbol}
					</div>
				))}
			</div>
			{/* Vowels Row */}
			<div className="flex flex-wrap gap-1">
				{vowels.map((symbol, i) => (
					<div
						key={i}
						className="w-7 h-7 flex items-center justify-center rounded bg-background/60 border border-primary/10 text-sm font-mono text-foreground/80"
					>
						{symbol}
					</div>
				))}
			</div>
		</div>
	);
}
