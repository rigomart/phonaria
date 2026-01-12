"use client";

import { PhonemeIpaRegistry, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ArrowRight, MoveRight } from "lucide-react";
import { useState } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details/phoneme-details-dialog";
import { Link } from "@/i18n/navigation";
import {
	Section,
	SectionContent,
	SectionDescription,
	SectionHeader,
	SectionText,
	SectionTitle,
} from "./section-layout";

// Organized by place of articulation: front to back of mouth
const PLACE_GROUPS: {
	place: string;
	label: string;
	description: string;
	pairs: { voiceless: PhonemeSymbolId; voiced: PhonemeSymbolId }[];
}[] = [
	{
		place: "lips",
		label: "Lips",
		description: "Both lips together",
		pairs: [{ voiceless: "voiceless-bilabial-plosive", voiced: "voiced-bilabial-plosive" }],
	},
	{
		place: "tongue",
		label: "Tongue tip",
		description: "Tongue behind teeth",
		pairs: [{ voiceless: "voiceless-alveolar-plosive", voiced: "voiced-alveolar-plosive" }],
	},
	{
		place: "back",
		label: "Back",
		description: "Back of tongue",
		pairs: [{ voiceless: "voiceless-velar-plosive", voiced: "voiced-velar-plosive" }],
	},
];

export function IpaVisualizerSection() {
	const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeSymbolId | null>(null);

	const getSymbol = (id: PhonemeSymbolId) => PhonemeIpaRegistry[id];

	return (
		<Section>
			<SectionText>
				<SectionHeader>
					<SectionTitle>Sounds Are Organized</SectionTitle>
					<SectionDescription>
						The IPA organizes consonants by where you make them in your mouth. Each position
						produces a pair: voiceless (like a whisper) and voiced (vocal cords vibrate). Click any
						symbol to feel the difference.
					</SectionDescription>
				</SectionHeader>

				<Button variant="outline" render={<Link href="/ipa-chart" />}>
					Explore the IPA Chart <ArrowRight />
				</Button>
			</SectionText>

			<SectionContent>
				<div className="space-y-3">
					<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
						<span>Front of mouth</span>
						<MoveRight className="size-3" />
						<span>Back of mouth</span>
					</div>

					<div className="flex items-stretch justify-between gap-2">
						{PLACE_GROUPS.map((group) => (
							<div key={group.place} className="flex flex-col items-center gap-1.5 flex-1">
								<div className="text-center">
									<span className="text-xs font-medium block">{group.label}</span>
									<span className="text-[10px] text-muted-foreground">{group.description}</span>
								</div>
								{group.pairs.map((pair) => (
									<div
										key={pair.voiceless}
										className="flex flex-col items-center gap-0.5 rounded-lg border p-1"
									>
										<button
											type="button"
											onClick={() => setSelectedPhoneme(pair.voiceless)}
											className="flex items-center justify-center size-9 rounded-md font-serif text-lg hover:bg-muted transition-colors"
											title="Voiceless"
										>
											{getSymbol(pair.voiceless)}
										</button>
										<span className="text-[10px] text-muted-foreground">voiceless</span>
										<div className="w-6 h-px bg-border my-0.5" />
										<button
											type="button"
											onClick={() => setSelectedPhoneme(pair.voiced)}
											className="flex items-center justify-center size-9 rounded-md font-serif text-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
											title="Voiced"
										>
											{getSymbol(pair.voiced)}
										</button>
										<span className="text-[10px] text-muted-foreground">voiced</span>
									</div>
								))}
							</div>
						))}
					</div>
				</div>

				{selectedPhoneme && (
					<PhonemeDetailsDialog
						open={!!selectedPhoneme}
						onOpenChange={(open) => !open && setSelectedPhoneme(null)}
						phonemeId={selectedPhoneme}
					/>
				)}
			</SectionContent>
		</Section>
	);
}
