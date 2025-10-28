"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMinimalPairSets } from "@/data/contrasts";
import { Link } from "@/i18n/navigation";
import { usePhonemeDetailsContext } from "./index";

const minimalPairSets = getMinimalPairSets();

export function TabPractice() {
	const { phoneme, maxContrasts } = usePhonemeDetailsContext();

	const matchingSets = minimalPairSets
		.filter((set) => set.focusPhonemes.includes(phoneme.symbol))
		.slice(0, maxContrasts);

	if (matchingSets.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-muted-foreground">
					No contrast exercises available for this phoneme yet.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3 pb-2">
			<p className="text-xs text-muted-foreground">
				Practice distinguishing{" "}
				<span className="font-semibold text-foreground">/{phoneme.symbol}/</span> from similar
				sounds through listening exercises.
			</p>
			<div className="space-y-3">
				{matchingSets.map((set) => {
					const partnerSymbol =
						set.focusPhonemes.find((symbol) => symbol !== phoneme.symbol) ?? set.focusPhonemes[0];
					const samplePair = set.pairs[0];

					return (
						<div
							key={set.id}
							className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4 space-y-3"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm font-semibold">
									/{phoneme.symbol}/ vs /{partnerSymbol}/
								</div>
								<Badge variant="outline" className="text-[10px] uppercase tracking-wide shrink-0">
									{set.category}
								</Badge>
							</div>
							<p className="text-xs leading-relaxed text-muted-foreground">{set.summary}</p>
							{samplePair ? (
								<div className="rounded-md border bg-background px-3 py-2 text-xs font-medium">
									{samplePair.words[0].word} · {samplePair.words[1].word}
								</div>
							) : null}
							<Link
								href={{ pathname: "/contrasts", query: { contrast: set.slug } }}
								className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
							>
								Start practice session
								<ArrowRight className="h-3 w-3" />
							</Link>
						</div>
					);
				})}
			</div>
		</div>
	);
}
