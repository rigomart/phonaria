import { phonariaUtils } from "shared-data";
import { AudioControls } from "@/components/audio-button";
import { Card, CardContent } from "@/components/ui/card";
import type { MinimalPairSet } from "@/data/contrasts";

const { toPhonemic } = phonariaUtils;

interface PairCardProps {
	set: MinimalPairSet;
}

export function PairCard({ set }: PairCardProps) {
	return (
		<Card className="border-border/80 bg-card">
			<CardContent className="space-y-4 p-4 sm:p-6">
				{set.pairs.map((pair) => (
					<div
						key={pair.id}
						className="space-y-3 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/15 p-3 sm:p-4"
					>
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<div className="flex flex-col gap-1">
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
									{pair.contrastLabel}
								</p>
								{pair.description ? (
									<p className="text-sm font-medium text-foreground">{pair.description}</p>
								) : null}
							</div>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							{pair.words.map((word) => (
								<div
									key={`${pair.id}-${word.word}`}
									className="flex flex-col gap-2 rounded-md border border-muted-foreground/30 bg-background/90 p-3"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="text-sm font-semibold leading-tight">
											{highlightGrapheme(word.word, word.graphemeHint)}
										</div>
										{word.audioUrl ? (
											<AudioControls src={word.audioUrl} label={`Play ${word.word}`} />
										) : null}
									</div>
									<span className="text-xs font-medium text-muted-foreground">
										{toPhonemic(word.phonemic)}
									</span>
									{word.pronunciationTip ? (
										<p className="text-xs text-muted-foreground">{word.pronunciationTip}</p>
									) : null}
								</div>
							))}
						</div>
						{pair.practiceNote ? (
							<p className="rounded-md bg-background/70 p-2 text-xs text-muted-foreground">
								{pair.practiceNote}
							</p>
						) : null}
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function highlightGrapheme(word: string, grapheme?: string) {
	if (!grapheme) return word;

	const index = word.toLowerCase().indexOf(grapheme.toLowerCase());
	if (index === -1) return word;

	const before = word.slice(0, index);
	const match = word.slice(index, index + grapheme.length);
	const after = word.slice(index + grapheme.length);

	return (
		<span>
			{before}
			<span className="text-primary">{match}</span>
			{after}
		</span>
	);
}
