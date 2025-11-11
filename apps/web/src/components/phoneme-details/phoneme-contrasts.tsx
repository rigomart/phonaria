import { EllipsisVerticalIcon, Info } from "lucide-react";
import {
	allPhonemeSymbols,
	contrastsByPhonemeId,
	featureValueByPhoneme,
	type PhonemeArticulatoryFeatureKey,
	type PhonemeArticulatoryFeatures,
	type PhonemeSymbolId,
} from "shared-data";
import { featureDefinitions } from "@/data/phoneme-details";
import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

function getFeatureValueDefinition<K extends PhonemeArticulatoryFeatureKey>(
	featureKey: K,
	valueKey: PhonemeArticulatoryFeatures[K] | undefined,
) {
	if (!valueKey) {
		return null;
	}

	return featureDefinitions[featureKey].values[valueKey];
}

export function PhonemeDetailsContrasts() {
	const { phonemeId } = usePhonemeDetailsContext();

	const t = useScopedI18n(`components.phoneme-details.contrasts`);

	const contrasts = contrastsByPhonemeId[phonemeId];
	const currentIpa = allPhonemeSymbols[phonemeId].ipa;

	if (!contrasts || contrasts.length === 0) {
		return null;
	}

	return (
		<section className="space-y-2 px-3 sm:px-4">
			<div className="flex items-center gap-1.5">
				<h3 className="text-base font-bold">{t("title")}</h3>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label={t("learn-more-aria")}
						>
							<Info className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="text-sm">{t("info-text")}</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-4">
				{contrasts.map((contrast) => {
					const partnerIpa = allPhonemeSymbols[contrast.partnerId].ipa;
					// Limit to first pair
					const displayPairs = contrast.minimalPairs[0];

					return (
						<div key={contrast.partnerId} className="flex flex-col">
							<ContrastTypeBadge
								type={contrast.contrastType}
								phoneme={{ id: phonemeId, ipa: currentIpa }}
								partner={{ id: contrast.partnerId, ipa: partnerIpa }}
							/>

							<div className="flex sm:flex-row flex-col p-2 rounded-b-lg border gap-2">
								<ExampleItem
									ipa={currentIpa}
									word={displayPairs[0].word}
									phonemic={displayPairs[0].phonemic}
									className="sm:flex-row-reverse"
								/>
								<div className="flex sm:flex-col items-center justify-center gap-1 overflow-hidden">
									<Separator orientation="vertical" className="sm:block hidden" />
									<Separator orientation="horizontal" className="block sm:hidden" />
									<span className="text-xs text-muted-foreground font-semibold">{t("vs")}</span>
									<Separator orientation="horizontal" className="block sm:hidden" />
									<Separator orientation="vertical" className="sm:block hidden" />
								</div>
								<ExampleItem
									ipa={partnerIpa}
									word={displayPairs[1].word}
									phonemic={displayPairs[1].phonemic}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

type ContrastTypeBadgeProps = {
	type: PhonemeArticulatoryFeatureKey[];
	phoneme: {
		id: PhonemeSymbolId;
		ipa: string;
	};
	partner: {
		id: PhonemeSymbolId;
		ipa: string;
	};
};

function ContrastTypeBadge({ type, phoneme, partner }: ContrastTypeBadgeProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					size="sm"
					variant="outline"
					className="flex sm:self-start justify-start gap-2 px-2 py-1 border rounded-none rounded-t-lg"
				>
					<span className="text-xs">Different in:</span>
					<div className="flex gap-1">
						{type.map((t) => (
							<Badge key={t} className="capitalize">
								{t}
							</Badge>
						))}
					</div>
					<EllipsisVerticalIcon className="size-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="p-2 w-full">
				<div className="space-y-2">
					{type.map((contrastType) => {
						const phonemeValueKey = featureValueByPhoneme[contrastType][phoneme.id];
						const partnerValueKey = featureValueByPhoneme[contrastType][partner.id];
						const phonemeValueDef = getFeatureValueDefinition(contrastType, phonemeValueKey);
						const partnerValueDef = getFeatureValueDefinition(contrastType, partnerValueKey);

						if (!phonemeValueDef || !partnerValueDef) {
							return null;
						}

						const featureDef = featureDefinitions[contrastType];

						return (
							<div key={contrastType} className="space-y-1">
								<div className="text-xs font-semibold text-muted-foreground uppercase">
									{featureDef.label}
								</div>
								<div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
									<div className="p-2 bg-primary/10 rounded border border-primary/20 space-y-1">
										<div className="text-xs font-semibold font-mono">
											/{phoneme.ipa}/ {phonemeValueDef.label}
										</div>
										<div className="text-xs text-muted-foreground leading-snug">
											{phonemeValueDef.description}
										</div>
									</div>
									<div className="flex items-center justify-center pt-2">
										<span className="text-xs text-muted-foreground">vs</span>
									</div>
									<div className="p-2 bg-secondary/20 rounded border border-secondary/30 space-y-1">
										<div className="text-xs font-semibold font-mono">
											/{partner.ipa}/ {partnerValueDef.label}
										</div>
										<div className="text-xs text-muted-foreground leading-snug">
											{partnerValueDef.description}
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}

type ExampleItemProps = {
	ipa: string;
	word: string;
	phonemic: string;
	className?: string;
};

function ExampleItem({ ipa, word, phonemic, className }: ExampleItemProps) {
	return (
		<div className={cn("flex rounded-lg flex-1", className)}>
			<div className="flex items-center px-2 sm:px-3">
				<span className="text-sm font-semibold text-muted-foreground/60">/</span>
				<span className="text-lg font-semibold">{ipa}</span>
				<span className="text-sm font-semibold text-muted-foreground/60">/</span>
			</div>

			<Item variant="outline" size="xs" className="flex-1 bg-background-strong">
				<ItemContent>
					<ItemTitle>{word}</ItemTitle>
					<ItemDescription className="text-xs text-muted-foreground font-mono">
						/{phonemic}/
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<AudioControls size="xs" path={`/phoneme-examples/${word}.mp3`} label={word} />
				</ItemActions>
			</Item>
		</div>
	);
}
