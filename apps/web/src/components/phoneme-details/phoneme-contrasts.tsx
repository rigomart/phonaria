import {
	getContrastRegistryForLanguage,
	getFeatureValueByPhonemeRegistryForLanguage,
	getIpaForPhonemeId,
	hasLanguageFeature,
	isPhonemeInLanguage,
	type LanguageFeatureValueByPhonemeRegistry,
	type LanguagePhonemeContrastRegistry,
	type PhonemeArticulatoryFeatureKey,
	type PhonemeArticulatoryFeatures,
} from "@phonaria/phonetics-data";
import { Badge } from "@phonaria/ui/components/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@phonaria/ui/components/item";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { LabelSeparator } from "@phonaria/ui/components/separator";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FeatureValueDefinition, PhonemeDetailsCopy } from "@/data/phoneme-details";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { cn } from "@/lib/utils";
import { AudioControls } from "../audio-controls";
import { usePhonemeDetailsContext } from "./phoneme-details-context";
import {
	PhonemeSection,
	PhonemeSectionContent,
	PhonemeSectionDescription,
	PhonemeSectionHeader,
	PhonemeSectionTitle,
} from "./phoneme-section";

function getFeatureValueDefinition<K extends PhonemeArticulatoryFeatureKey>(
	featureDefinitions: PhonemeDetailsCopy["featureDefinitions"],
	featureKey: K,
	valueKey: PhonemeArticulatoryFeatures[K] | undefined,
): FeatureValueDefinition | null {
	if (!valueKey) {
		return null;
	}

	const feature = featureDefinitions[featureKey];
	if (!feature) return null;

	const value = feature.values[valueKey];
	return value ?? null;
}

export function PhonemeDetailsContrasts() {
	const { phonemeId, targetLanguage } = usePhonemeDetailsContext();
	const t = useTranslations(`components.phoneme-details.contrasts`);
	const { featureDefinitions } = usePhonemeDetailsCopy();
	if (!hasLanguageFeature(targetLanguage, "contrasts")) {
		return null;
	}
	if (!isPhonemeInLanguage(targetLanguage, phonemeId)) {
		return null;
	}

	const featureValuesByPhoneme = getFeatureValueByPhonemeRegistryForLanguage(
		targetLanguage,
	) as LanguageFeatureValueByPhonemeRegistry;
	const contrastRegistry = getContrastRegistryForLanguage(
		targetLanguage,
	) as LanguagePhonemeContrastRegistry | null;
	if (!contrastRegistry) return null;
	const currentPhonemeId = phonemeId;

	const contrasts = contrastRegistry[currentPhonemeId];
	const currentIpa = getIpaForPhonemeId(currentPhonemeId);
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
					if (!isPhonemeInLanguage(targetLanguage, contrast.partnerId)) {
						return null;
					}
					const partnerPhonemeId = contrast.partnerId;
					const partnerIpa = getIpaForPhonemeId(partnerPhonemeId);
					// Limit to first pair
					const displayPairs = contrast.minimalPairs[0];

					return (
						<article key={partnerPhonemeId} className="flex flex-col">
							<header className="flex items-center border rounded-t-lg py-2 px-3 gap-2">
								<span className="text-sm text-muted-foreground">{t("differs-in")}</span>
								<div className="flex gap-1">
									{contrast.contrastType.map((type) => {
										const phonemeValueKey = featureValuesByPhoneme[type][currentPhonemeId];
										const partnerValueKey = featureValuesByPhoneme[type][partnerPhonemeId];
										const phonemeValueDef = getFeatureValueDefinition(
											featureDefinitions,
											type,
											phonemeValueKey,
										);
										const partnerValueDef = getFeatureValueDefinition(
											featureDefinitions,
											type,
											partnerValueKey,
										);

										if (!phonemeValueDef || !partnerValueDef) {
											return null;
										}

										return (
											<Popover key={type}>
												<PopoverTrigger
													render={
														<Badge
															variant="success"
															key={type}
															className="capitalize"
															render={<button type="button" />}
														/>
													}
												>
													{type}
													<Info className="h-3 w-3 opacity-60" />
												</PopoverTrigger>
												<PopoverContent tooltipStyle>
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
												</PopoverContent>
											</Popover>
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
					<AudioControls size="sm" path={`/audio/${word}.mp3`} label={word} variant="compact" />
				</ItemActions>
			</Item>
		</div>
	);
}
