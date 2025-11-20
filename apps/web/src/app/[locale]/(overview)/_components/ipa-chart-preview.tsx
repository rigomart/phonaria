export function IpaChartPreview() {
	// Consonant pairs showing voiceless/voiced contrast
	const consonantPairs = [
		{ voiceless: "p", voiced: "b" },
		{ voiceless: "t", voiced: "d" },
		{ voiceless: "k", voiced: "g" },
		{ voiceless: "f", voiced: "v" },
		{ voiceless: "θ", voiced: "ð" },
		{ voiceless: "s", voiced: "z" },
	];

	const vowels = ["i", "ɪ", "eɪ", "ɛ", "æ", "ɑ", "ɔ", "oʊ", "ʊ", "u"];

	return (
		<div className="space-y-3 rounded-lg border border-border/40 bg-background p-3">
			<div>
				<h3 className="text-sm font-medium text-muted-foreground mb-2">Consonants</h3>
				<div className="grid grid-cols-3 gap-2">
					{consonantPairs.map(({ voiceless, voiced }) => (
						<div
							key={`${voiceless}-${voiced}`}
							className="flex items-center justify-center gap-1.5"
						>
							<button
								type="button"
								className="min-w-[2rem] min-h-[2rem] px-2 py-1 rounded-md border border-border bg-background opacity-80 hover:opacity-100 hover:border-primary hover:bg-primary/5 transition-all text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{voiceless}
							</button>
							<button
								type="button"
								className="min-w-[2rem] min-h-[2rem] px-2 py-1 rounded-md border border-primary/20 bg-primary/5 font-semibold hover:border-primary hover:bg-primary/10 transition-all text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{voiced}
							</button>
						</div>
					))}
				</div>
			</div>
			<div>
				<h3 className="text-sm font-medium text-muted-foreground mb-2">Vowels</h3>
				<div className="flex flex-wrap gap-1.5">
					{vowels.map((symbol) => (
						<button
							key={symbol}
							type="button"
							className="min-w-[2rem] min-h-[2rem] px-2 py-1 rounded-md border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{symbol}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
