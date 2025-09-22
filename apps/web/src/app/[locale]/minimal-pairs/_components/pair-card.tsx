import { AudioControls } from "@/components/audio-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { phonixUtils } from "shared-data";
import type { MinimalPairSet } from "shared-data";

const { toPhonemic } = phonixUtils;

interface PairCardProps {
	pair: MinimalPairSet["pairs"][number];
}

export function PairCard({ pair }: PairCardProps) {
	return (
		<Card className="border-border/80 bg-card transition hover:border-primary/40">
			<CardHeader className="gap-2 pb-4">
				<CardTitle className="text-base font-semibold">{pair.contrastLabel}</CardTitle>
				{pair.description ? <CardDescription>{pair.description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid gap-3 md:grid-cols-2 md:gap-4">
					{pair.words.map((word) => (
						<Card key={word.word} className="border-dashed border-muted/60 bg-background/95">
							<CardContent className="space-y-3 py-4">
								<div className="flex items-center justify-between gap-2">
									<div className="text-lg font-semibold leading-tight">
										{highlightGrapheme(word.word, word.graphemeHint)}
									</div>
									{word.audioUrl ? (
										<AudioControls src={word.audioUrl} label={`Play ${word.word}`} />
									) : null}
								</div>
								<div className="text-xs font-medium text-muted-foreground">
									{toPhonemic(word.phonemic)}
								</div>
								{word.pronunciationTip ? (
									<p className="text-xs text-muted-foreground">{word.pronunciationTip}</p>
								) : null}
							</CardContent>
						</Card>
					))}
				</div>
				{pair.practiceNote ? (
					<div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-3 text-xs text-muted-foreground">
						{pair.practiceNote}
					</div>
				) : null}
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
