import type { MinimalPairSet } from "shared-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getManyPhonemes } from "@/lib/phonemes";

interface ArticulationPanelProps {
	set: MinimalPairSet;
}

export function ArticulationPanel({ set }: ArticulationPanelProps) {
	const phonemes = getManyPhonemes(set.focusPhonemes);

	if (!set.articulationHighlights.length) return null;

	return (
		<section id="minimal-pair-articulation" className="grid gap-6">
			<Card className="border-muted-foreground/20 bg-muted/10">
				<CardHeader>
					<CardTitle className="text-xl">Articulation snapshot</CardTitle>
					<CardDescription className="text-sm">
						Compare production tips for each phoneme to fine-tune your listening and self-practice.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					{set.articulationHighlights.map((highlight) => {
						const phonemeData = phonemes.find((item) => item.symbol === highlight.phoneme);

						return (
							<Card
								key={highlight.phoneme}
								className="border border-dashed border-muted-foreground/30 bg-background"
							>
								<CardHeader className="gap-2">
									<CardTitle className="text-lg">
										<span className="text-primary">/{highlight.phoneme}/</span> ·{" "}
										{highlight.headline}
									</CardTitle>
									{phonemeData ? (
										<CardDescription>{phonemeData.description}</CardDescription>
									) : null}
								</CardHeader>
								<CardContent className="space-y-3 text-sm text-muted-foreground">
									<p>{highlight.details}</p>
									{phonemeData ? <PhonemeFeatureList phonemeSymbol={phonemeData.symbol} /> : null}
								</CardContent>
							</Card>
						);
					})}
				</CardContent>
			</Card>
		</section>
	);
}

function PhonemeFeatureList({ phonemeSymbol }: { phonemeSymbol: string }) {
	const phoneme = getManyPhonemes([phonemeSymbol])[0];

	if (!phoneme) return null;

	const coreDetails =
		phoneme.category === "consonant"
			? [
					`Voicing: ${phoneme.articulation.voicing}`,
					`Place: ${phoneme.articulation.place}`,
					`Manner: ${phoneme.articulation.manner}`,
				]
			: [
					`Height: ${phoneme.articulation.height}`,
					`Frontness: ${phoneme.articulation.frontness}`,
					`Rounded: ${phoneme.articulation.roundness}`,
					`Tenseness: ${phoneme.articulation.tenseness}`,
				];

	return (
		<ul className="grid gap-1 text-xs text-muted-foreground">
			{coreDetails.map((detail) => (
				<li key={`${phoneme.symbol}-${detail}`}>{detail}</li>
			))}
		</ul>
	);
}
