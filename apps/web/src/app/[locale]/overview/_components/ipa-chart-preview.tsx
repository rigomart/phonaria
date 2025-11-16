export function IpaChartPreview() {
	const vowelSamples = [
		{ symbol: "i", word: "see" },
		{ symbol: "ɪ", word: "sit" },
		{ symbol: "eɪ", word: "say" },
		{ symbol: "æ", word: "cat" },
		{ symbol: "ɑ", word: "father" },
		{ symbol: "ɔ", word: "thought" },
	];
	const consonantSamples = [
		{ symbol: "p", word: "pen" },
		{ symbol: "b", word: "big" },
		{ symbol: "t", word: "top" },
		{ symbol: "d", word: "dog" },
		{ symbol: "k", word: "cat" },
		{ symbol: "ʃ", word: "ship" },
		{ symbol: "θ", word: "think" },
		{ symbol: "ŋ", word: "sing" },
	];

	return (
		<div className="rounded-lg border border-border bg-card">
			<div className="border-b border-border bg-muted/30 px-4 py-3">
				<p className="text-xs font-medium text-muted-foreground">Sample phonemes</p>
			</div>
			<div className="p-4 space-y-4">
				<div>
					<h3 className="text-xs font-semibold text-foreground mb-2">Vowels</h3>
					<div className="grid grid-cols-3 gap-2">
						{vowelSamples.map(({ symbol, word }) => (
							<div
								key={symbol}
								className="flex flex-col items-center gap-1 p-2 rounded border border-border bg-background hover:bg-accent hover:border-primary/50 cursor-pointer transition-colors"
							>
								<span className="text-lg font-mono">{symbol}</span>
								<span className="text-[10px] text-muted-foreground">{word}</span>
							</div>
						))}
					</div>
				</div>
				<div>
					<h3 className="text-xs font-semibold text-foreground mb-2">Consonants</h3>
					<div className="grid grid-cols-4 gap-2">
						{consonantSamples.map(({ symbol, word }) => (
							<div
								key={symbol}
								className="flex flex-col items-center gap-1 p-2 rounded border border-border bg-background hover:bg-accent hover:border-primary/50 cursor-pointer transition-colors"
							>
								<span className="text-lg font-mono">{symbol}</span>
								<span className="text-[10px] text-muted-foreground">{word}</span>
							</div>
						))}
					</div>
				</div>
				<p className="text-xs text-muted-foreground">
					Click any phoneme to hear it and see how it's produced
				</p>
			</div>
		</div>
	);
}
