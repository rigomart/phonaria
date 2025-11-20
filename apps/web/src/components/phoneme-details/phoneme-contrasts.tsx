import { Info } from "lucide-react";
import {
	ContrastsByPhonemeIdRegistry,
	FeatureValueByPhonemeRegistry,
	type PhonemeArticulatoryFeatureKey,
	type PhonemeArticulatoryFeatures,
	PhonemeSymbolRegistry,
} from "shared-data";
import { type FeatureValueDefinition, featureDefinitions } from "@/data/phoneme-details";
import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { LabelSeparator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { usePhonemeDetailsContext } from "./phoneme-details-context";
import {
	PhonemeSection,
	PhonemeSectionContent,
	PhonemeSectionDescription,
	PhonemeSectionHeader,
	PhonemeSectionTitle,
} from "./phoneme-section";

function getFeatureValueDefinition<K extends PhonemeArticulatoryFeatureKey>(
	featureKey: K,
	valueKey: PhonemeArticulatoryFeatures[K] | undefined,
): FeatureValueDefinition | null {
	if (!valueKey) {
		return null;
	}

	const feature = featureDefinitions[featureKey];
	const value = feature.values[valueKey];
	return value ?? null;
}

export function PhonemeDetailsContrasts() {
	const { phonemeId } = usePhonemeDetailsContext();

	const t = useScopedI18n(`components.phoneme-details.contrasts`);

	const contrasts = ContrastsByPhonemeIdRegistry[phonemeId];
	const currentIpa = PhonemeSymbolRegistry[phonemeId].ipa;
	const vsLabel = t("vs");

	if (!contrasts || contrasts.length === 0) {
		return null;
	}

	return (
		<PhonemeSection>
			<PhonemeSectionHeader>
				<PhonemeSectionTitle>{t("title")}</PhonemeSectionTitle>
				<PhonemeSectionDescription>{t("description")}</PhonemeSectionDescription>
			</PhonemeSectionHeader>
			<PhonemeSectionContent>
				{contrasts.map((contrast) => {
					const partnerIpa = PhonemeSymbolRegistry[contrast.partnerId].ipa;
					// Limit to first pair
					const displayPairs = contrast.minimalPairs[0];

					return (
						<article key={contrast.partnerId} className="flex flex-col">
							<header className="flex items-center border rounded-t-lg py-2 px-3 gap-2">
								<span className="text-sm text-muted-foreground">{t("differs-in")}</span>
								<div className="flex gap-1">
									{contrast.contrastType.map((type) => {
										const phonemeValueKey = FeatureValueByPhonemeRegistry[type][phonemeId];
										const partnerValueKey = FeatureValueByPhonemeRegistry[type][contrast.partnerId];
										const phonemeValueDef = getFeatureValueDefinition(type, phonemeValueKey);
										const partnerValueDef = getFeatureValueDefinition(type, partnerValueKey);

										if (!phonemeValueDef || !partnerValueDef) {
											return null;
										}

										return (
											<Tooltip key={type}>
												<TooltipTrigger asChild>
													<Badge
														variant="accent"
														key={type}
														className="capitalize cursor-help gap-1"
													>
														{type}
														<Info className="h-3 w-3 opacity-60" />
													</Badge>
												</TooltipTrigger>
												<TooltipContent>
													<div className="flex gap-2">
														<div className="flex flex-col gap-1 max-w-32">
															<p className="font-semibold text-sm">{phonemeValueDef.label}</p>
															<p className="text-xs leading-tight">{phonemeValueDef.description}</p>
														</div>
														<LabelSeparator label={vsLabel} orientation="vertical" />
														<div className="flex flex-col gap-1 max-w-32">
															<p className="font-semibold text-sm">{partnerValueDef.label}</p>
															<p className="text-xs leading-tight">{partnerValueDef.description}</p>
														</div>
													</div>
												</TooltipContent>
											</Tooltip>
										);
									})}
								</div>
							</header>

							<div className="flex sm:flex-row flex-col p-3 rounded-b-lg border gap-2">
								<ExampleItem
									ipa={currentIpa}
									word={displayPairs[0].word}
									phonemic={displayPairs[0].phonemic}
									className="sm:flex-row-reverse"
								/>
								<LabelSeparator label={vsLabel} orientation="vertical" className="hidden sm:flex" />
								<LabelSeparator
									label={vsLabel}
									orientation="horizontal"
									className="flex sm:hidden"
								/>
								<ExampleItem
									ipa={partnerIpa}
									word={displayPairs[1].word}
									phonemic={displayPairs[1].phonemic}
								/>
							</div>
						</article>
					);
				})}
			</PhonemeSectionContent>
		</PhonemeSection>
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
				<span className="text-xs font-semibold text-muted-foreground/60">/</span>
				<span className="text-base font-semibold">{ipa}</span>
				<span className="text-xs font-semibold text-muted-foreground/60">/</span>
			</div>

			<Item variant="outline" size="xs" className="flex-1 bg-background-strong">
				<ItemContent>
					<ItemTitle>{word}</ItemTitle>
					<ItemDescription className="text-xs text-muted-foreground">/{phonemic}/</ItemDescription>
				</ItemContent>
				<ItemActions>
					<AudioControls
						size="xs"
						path={`/phoneme-examples/${word}.mp3`}
						label={word}
						variant="compact"
					/>
				</ItemActions>
			</Item>
		</div>
	);
}
