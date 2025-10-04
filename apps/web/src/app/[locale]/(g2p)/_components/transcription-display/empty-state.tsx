"use client";

import { Button } from "@/components/ui/button";
import { useTranscribe } from "../../_hooks/use-g2p";

export function EmptyState() {
	const transcribeMutation = useTranscribe();

	// Mix of simple examples and stress pattern examples
	const examples = [
		"hello world",
		"pronunciation",
		"Judge the rhythm",
		"She chose well",
		"Through thick fog",
	];

	const handleExampleClick = (example: string) => {
		transcribeMutation.mutate(example);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 px-4">
			<div className="space-y-3 max-w-lg">
				<h2 className="text-lg font-medium text-foreground">
					Enter text to see phonetic transcription
				</h2>
				<p className="text-sm leading-relaxed text-muted-foreground">
					Type any English word or sentence above to see how it's pronounced using the International
					Phonetic Alphabet (IPA).
				</p>
			</div>

			<div className="bg-muted/30 rounded-lg p-5 border border-border/40 max-w-md w-full">
				<h3 className="font-medium mb-4 text-base">What you'll see</h3>
				<div className="space-y-4">
					{/* IPA Example */}
					<div className="text-center space-y-2">
						<div className="font-mono text-primary text-xl bg-primary/5 px-3 py-2 rounded border border-primary/20">
							həˈlɵʊ wɜrld
						</div>
						<p className="text-xs text-muted-foreground">Words broken down into phonetic sounds</p>
					</div>

					{/* Features */}
					<div className="space-y-3 pt-3 border-t border-border/30">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 flex-shrink-0">
								<span className="text-primary text-xs">▶</span>
							</div>
							<div className="min-w-0">
								<div className="text-sm font-medium text-foreground">
									Click phonemes to hear pronunciation
								</div>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 flex-shrink-0">
								<span className="text-primary text-xs">ℹ</span>
							</div>
							<div className="min-w-0">
								<div className="text-sm font-medium text-foreground">
									View mouth position details
								</div>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 flex-shrink-0">
								<span className="text-primary text-xs">📖</span>
							</div>
							<div className="min-w-0">
								<div className="text-sm font-medium text-foreground">Dictionary definitions</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Interactive Examples */}
			<div className="space-y-3 max-w-lg w-full">
				<p className="text-xs text-muted-foreground">Try these examples:</p>
				<div className="flex flex-wrap justify-center gap-2">
					{examples.map((example) => (
						<Button
							key={example}
							type="button"
							onClick={() => handleExampleClick(example)}
							className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-100 disabled:opacity-50 disabled:transform-none disabled:shadow-none border border-transparent hover:border-primary/20"
							disabled={transcribeMutation.isPending}
							size="sm"
						>
							"{example}"
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
