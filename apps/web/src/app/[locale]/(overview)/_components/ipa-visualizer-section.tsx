"use client";

import { PhonemeIpaRegistry, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { Link } from "@/i18n/navigation";

// Organized by place of articulation: front to back of mouth
const PLACE_GROUPS: {
	place: string;
	label: string;
	pairs: { voiceless: PhonemeSymbolId; voiced: PhonemeSymbolId }[];
}[] = [
	{
		place: "lips",
		label: "Lips",
		pairs: [{ voiceless: "voiceless-bilabial-plosive", voiced: "voiced-bilabial-plosive" }],
	},
	{
		place: "tongue",
		label: "Tongue",
		pairs: [{ voiceless: "voiceless-alveolar-plosive", voiced: "voiced-alveolar-plosive" }],
	},
	{
		place: "back",
		label: "Back",
		pairs: [{ voiceless: "voiceless-velar-plosive", voiced: "voiced-velar-plosive" }],
	},
];

export function IpaVisualizerSection() {
	const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeSymbolId | null>(null);

	const getSymbol = (id: PhonemeSymbolId) => PhonemeIpaRegistry[id];

	return (
		<section className="grid md:grid-cols-2 gap-6 items-center py-4">
			{/* Text Column */}
			<div className="space-y-3">
				<div className="space-y-2">
					<h2 className="text-base font-semibold tracking-tight">Sounds Are Organized</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						IPA organizes sounds by where you make them. These pairs differ only in voicing - click
						any symbol to explore.
					</p>
				</div>

				<Button variant="outline" render={<Link href="/ipa-chart" />}>
					Explore the IPA Chart <ArrowRight />
				</Button>
			</div>

			{/* Interactive Column - Front to Back Journey */}
			<div className="rounded-xl border bg-muted/30 p-3">
				<div className="flex items-center justify-between gap-2">
					{PLACE_GROUPS.map((group) => (
						<div key={group.place} className="flex flex-col items-center gap-1.5 flex-1">
							<span className="text-xs font-medium text-muted-foreground">{group.label}</span>
							{group.pairs.map((pair) => (
								<div
									key={pair.voiceless}
									className="flex items-center gap-1 rounded-lg border bg-background p-1"
								>
									<button
										type="button"
										onClick={() => setSelectedPhoneme(pair.voiceless)}
										className="flex items-center justify-center size-9 rounded-md font-serif text-lg hover:bg-muted transition-colors"
									>
										{getSymbol(pair.voiceless)}
									</button>
									<span className="text-muted-foreground/50 text-xs">/</span>
									<button
										type="button"
										onClick={() => setSelectedPhoneme(pair.voiced)}
										className="flex items-center justify-center size-9 rounded-md font-serif text-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
									>
										{getSymbol(pair.voiced)}
									</button>
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Phoneme Details Dialog */}
			{selectedPhoneme && (
				<PhonemeDetailsDialog
					open={!!selectedPhoneme}
					onOpenChange={(open) => !open && setSelectedPhoneme(null)}
					phonemeId={selectedPhoneme}
				/>
			)}
		</section>
	);
}
