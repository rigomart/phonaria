"use client";

import {
	PhonemeArticulationRegistry,
	PhonemeIpaRegistry,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@phonaria/ui/components/tooltip";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const VOWEL_IDS: PhonemeSymbolId[] = [
	"close-front-unrounded",
	"close-back-rounded",
	"open-back-unrounded",
	"near-open-front-unrounded",
];

const CONSONANT_IDS: PhonemeSymbolId[] = [
	"voiceless-bilabial-plosive",
	"voiced-bilabial-plosive",
	"voiceless-alveolar-plosive",
	"voiced-alveolar-plosive",
	"voiceless-velar-plosive",
	"voiced-velar-plosive",
	"voiceless-labiodental-fricative",
	"voiced-labiodental-fricative",
];

export function IpaVisualizerSection() {
	const getPhonemeData = (id: PhonemeSymbolId) => {
		const symbol = PhonemeIpaRegistry[id];
		const articulation =
			PhonemeArticulationRegistry[id as keyof typeof PhonemeArticulationRegistry];
		return { symbol, articulation };
	};

	return (
		<section className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
			{/* Text Column */}
			<div className="space-y-6">
				<div className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">
						The International Phonetic Alphabet
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Linguists developed the IPA to solve spelling ambiguity. In this system, one symbol
						always represents exactly one sound, providing a reliable map for pronunciation.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Symbols are organized by how they are produced physically—categorized by tongue
						position, airflow, and voicing.
					</p>
				</div>

				<div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg border border-border/50">
					<p className="flex-1">
						The full chart includes audio, sagittal diagrams, and example words for every phoneme.
					</p>
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0 text-primary whitespace-nowrap"
						render={<Link href="/ipa-chart" />}
					>
						View Chart <ArrowRight className="ml-1 size-3" />
					</Button>
				</div>
			</div>

			{/* Interactive Column */}
			<div className="rounded-xl border bg-card/50 p-6 space-y-6">
				<div className="space-y-3">
					<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Sample Vowels
					</h3>
					<div className="flex flex-wrap gap-2">
						{VOWEL_IDS.map((id) => {
							const { symbol, articulation } = getPhonemeData(id);
							return (
								<TooltipProvider key={id}>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="size-10 rounded-md border bg-background hover:border-primary hover:text-primary transition-colors flex items-center justify-center text-lg font-serif"
											>
												{symbol}
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-medium capitalize text-xs">{articulation.label}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							);
						})}
					</div>
				</div>

				<div className="space-y-3">
					<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Sample Consonants
					</h3>
					<div className="flex flex-wrap gap-2">
						{CONSONANT_IDS.map((id) => {
							const { symbol, articulation } = getPhonemeData(id);
							return (
								<TooltipProvider key={id}>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="size-10 rounded-md border bg-background hover:border-primary hover:text-primary transition-colors flex items-center justify-center text-lg font-serif"
											>
												{symbol}
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-medium capitalize text-xs">{articulation.label}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
