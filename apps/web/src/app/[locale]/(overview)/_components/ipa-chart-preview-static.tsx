"use client";

export function IpaChartPreviewStatic() {
	// Vowels to display in the grid
	const vowels = ["i", "ɪ", "ʊ", "u", "eɪ", "ə", "oʊ", "ɛ", "ʌ", "ɔ", "æ", "ɑ"];

	// Consonants to display
	const consonants = [
		"p",
		"b",
		"t",
		"d",
		"k",
		"g",
		"f",
		"v",
		"θ",
		"ð",
		"s",
		"z",
		"ʃ",
		"ʒ",
		"h",
		"m",
		"n",
		"ŋ",
	];

	return (
		<div className="w-full bg-background rounded-md border border-border/50 shadow-sm p-3 select-none">
			<div className="flex flex-col gap-4">
				{/* Vowels Grid */}
				<div className="space-y-1.5">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-0.5">
						Vowels
					</div>
					<div className="flex flex-wrap gap-1.5">
						{vowels.map((v) => (
							<div
								key={v}
								className="size-8 flex items-center justify-center rounded-md bg-primary/5 border border-primary/10 text-sm font-medium text-foreground"
							>
								{v}
							</div>
						))}
					</div>
				</div>

				{/* Consonants Grid */}
				<div className="space-y-1.5">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-0.5">
						Consonants
					</div>
					<div className="flex flex-wrap gap-1.5">
						{consonants.map((c) => (
							<div
								key={c}
								className="size-8 flex items-center justify-center rounded-md bg-muted/30 border border-border/50 text-sm font-medium text-foreground"
							>
								{c}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
