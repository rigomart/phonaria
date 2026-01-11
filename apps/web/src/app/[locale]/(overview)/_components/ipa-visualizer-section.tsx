"use client";

import { PhonemeIpaRegistry, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";

const VOWEL_IDS: PhonemeSymbolId[] = [
	"close-front-unrounded",
	"close-back-rounded",
	"open-back-unrounded",
	"near-open-front-unrounded",
];

// Organized as voiced/voiceless pairs to demonstrate IPA's logical structure
const CONSONANT_PAIRS: [PhonemeSymbolId, PhonemeSymbolId][] = [
	["voiceless-bilabial-plosive", "voiced-bilabial-plosive"], // p / b
	["voiceless-alveolar-plosive", "voiced-alveolar-plosive"], // t / d
	["voiceless-velar-plosive", "voiced-velar-plosive"], // k / g
	["voiceless-labiodental-fricative", "voiced-labiodental-fricative"], // f / v
];

export function IpaVisualizerSection() {
	const { phonemeDetailsById } = usePhonemeDetailsCopy();

	const getPhonemeData = (id: PhonemeSymbolId) => {
		const symbol = PhonemeIpaRegistry[id];
		const label = phonemeDetailsById[id]?.label ?? id;
		return { symbol, label };
	};

	return (
		<section className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
			{/* Text Column */}
			<div className="space-y-6">
				<div className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">
						One Symbol, One Sound
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						The IPA fixes spelling confusion. Each symbol represents exactly one sound. No
						exceptions, no guessing.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Sounds are grouped by how you make them: where your tongue goes, how air moves, and
						whether your voice box vibrates.
					</p>
				</div>

				<Button
					variant="outline"
					size="sm"
					className="w-full sm:w-auto"
					render={<Link href="/ipa-chart" />}
				>
					View the full IPA Chart <ArrowRight className="ml-2 size-3" />
				</Button>
			</div>

			{/* Interactive Column */}
			<div className="rounded-xl border bg-background p-6 space-y-6">
				<div className="space-y-3">
					<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Sample Vowels
					</h3>
					<div className="flex flex-wrap gap-2">
						{VOWEL_IDS.map((id) => {
							const { symbol, label } = getPhonemeData(id);
							return (
								<Tooltip key={id}>
									<TooltipTrigger
										render={
											<button
												type="button"
												className="size-10 rounded-md border bg-background hover:border-primary hover:text-primary transition-colors flex items-center justify-center text-lg font-serif"
											/>
										}
									>
										{symbol}
									</TooltipTrigger>
									<TooltipContent>
										<p className="font-medium capitalize text-xs">{label}</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>

				<div className="space-y-3">
					<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Consonant Pairs (voiceless / voiced)
					</h3>
					<div className="flex flex-wrap gap-3">
						{CONSONANT_PAIRS.map(([voicelessId, voicedId]) => {
							const voiceless = getPhonemeData(voicelessId);
							const voiced = getPhonemeData(voicedId);
							return (
								<div
									key={voicelessId}
									className="flex items-center gap-1 bg-background rounded-md border p-1"
								>
									<Tooltip>
										<TooltipTrigger
											render={
												<button
													type="button"
													className="size-9 rounded hover:bg-muted hover:text-primary transition-colors flex items-center justify-center text-lg font-serif"
												/>
											}
										>
											{voiceless.symbol}
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-medium capitalize text-xs">{voiceless.label}</p>
										</TooltipContent>
									</Tooltip>
									<span className="text-muted-foreground text-xs">/</span>
									<Tooltip>
										<TooltipTrigger
											render={
												<button
													type="button"
													className="size-9 rounded hover:bg-muted hover:text-primary transition-colors flex items-center justify-center text-lg font-serif"
												/>
											}
										>
											{voiced.symbol}
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-medium capitalize text-xs">{voiced.label}</p>
										</TooltipContent>
									</Tooltip>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
