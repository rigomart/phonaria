export function G2PPreview() {
	// Correct transcription: thoughtful = /ˈθɔtfəl/ | learner = /ˈlɝnɝ/
	const word1 = { word: "thoughtful", phonemes: ["ˈ", "θ", "ɔ", "t", "f", "ə", "l"] };
	const word2 = { word: "learner", phonemes: ["ˈ", "l", "ɝ", "n", "ɝ"] };

	return (
		<div className="flex flex-wrap items-start justify-center gap-6 bg-muted/20 border border-border/40 rounded-lg p-4">
			{[word1, word2].map((word) => (
				<div key={word.word} className="flex flex-col items-center text-center">
					<div className="text-lg text-muted-foreground font-normal mb-2 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer transition-colors">
						{word.word}
					</div>
					<div className="flex items-center gap-0.5">
						{word.phonemes.map((symbol, index) => (
							<button
								key={`${word.word}-${index}-${symbol}`}
								type="button"
								className="font-mono text-3xl bg-transparent border-none p-1.5 rounded hover:text-primary hover:bg-primary/5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							>
								{symbol}
							</button>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
