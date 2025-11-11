import {
	allPhonemeSymbols,
	contrastsByPhonemeId,
	featureValueByPhoneme,
	type PhonemeArticulatoryFeatureKey,
	type PhonemeArticulatoryFeatures,
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

function getFeatureValueDefinition<K extends PhonemeArticulatoryFeatureKey>(
	featureKey: K,
	valueKey: PhonemeArticulatoryFeatures[K] | undefined,
): FeatureValueDefinition | null {
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
	const vsLabel = t("vs");

	if (!contrasts || contrasts.length === 0) {
		return null;
	}

	return (
		<section className="space-y-4 px-3 sm:px-4">
			<div className="flex flex-col gap-1">
				<h3 className="text-base font-bold">{t("title")}</h3>
				<p className="text-xs text-muted-foreground">{t("description")}</p>
			</div>
			<div className="space-y-4">
				{contrasts.map((contrast) => {
					const partnerIpa = allPhonemeSymbols[contrast.partnerId].ipa;
					// Limit to first pair
					const displayPairs = contrast.minimalPairs[0];

					return (
						<div key={contrast.partnerId} className="flex flex-col">
							<div className="flex items-center border rounded-t-lg py-1 px-2 gap-2">
								<span className="text-xs text-muted-foreground">Contrasts in:</span>
								<div className="flex gap-1">
									{contrast.contrastType.map((type) => {
										const phonemeValueKey = featureValueByPhoneme[type][phonemeId];
										const partnerValueKey = featureValueByPhoneme[type][contrast.partnerId];
										const phonemeValueDef = getFeatureValueDefinition(type, phonemeValueKey);
										const partnerValueDef = getFeatureValueDefinition(type, partnerValueKey);

										if (!phonemeValueDef || !partnerValueDef) {
											return null;
										}

										return (
											<Tooltip key={type}>
												<TooltipTrigger asChild>
													<Badge variant="secondary" key={type} className="capitalize cursor-help">
														{type}
													</Badge>
												</TooltipTrigger>
												<TooltipContent>
													<div className="flex gap-2">
														<div className="flex flex-col gap-1 max-w-32">
															<p>{phonemeValueDef.label}</p>
															<p>{phonemeValueDef.description}</p>
														</div>
														<LabelSeparator label={vsLabel} orientation="vertical" />
														<div className="flex flex-col gap-1 max-w-32">
															<p>{partnerValueDef.label}</p>
															<p>{partnerValueDef.description}</p>
														</div>
													</div>
												</TooltipContent>
											</Tooltip>
										);
									})}
								</div>
							</div>

							<div className="flex sm:flex-row flex-col p-2 rounded-b-lg border gap-2">
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
						</div>
					);
				})}
			</div>
		</section>
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
