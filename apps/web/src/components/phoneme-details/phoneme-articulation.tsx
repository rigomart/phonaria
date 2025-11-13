import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import {
	allPhonemeSymbols,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	phonemeArticulations,
} from "shared-data";
import {
	type ArticulatoryFeature,
	diphthongTargetDefinitions,
	featureDefinitions,
	phonemeDetailsById,
} from "@/data/phoneme-details";
import { useScopedI18n } from "@/locales/client";
import { AspectRatio } from "../ui/aspect-ratio";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Pressable } from "../ui/pressable";
import { Separator } from "../ui/separator";
import { usePhonemeDetailsContext } from "./phoneme-details-context";
import {
	PhonemeSection,
	PhonemeSectionContent,
	PhonemeSectionDescription,
	PhonemeSectionHeader,
	PhonemeSectionTitle,
} from "./phoneme-section";
import { VowelChartCard } from "./phoneme-vowel-chart";

export function PhonemeDetailsArticulation() {
	const { phonemeId } = usePhonemeDetailsContext();

	const articulation = phonemeArticulations[phonemeId];

	const t = useScopedI18n(`components.phoneme-details.articulation`);

	return (
		<PhonemeSection>
			<PhonemeSectionHeader>
				<PhonemeSectionTitle>{t("title")}</PhonemeSectionTitle>
				<PhonemeSectionDescription>{t("description")}</PhonemeSectionDescription>
			</PhonemeSectionHeader>
			<PhonemeSectionContent>
				<div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div className="col-span-2">
						<ArticulationIllustration phonemeId={phonemeId} articulation={articulation} />
					</div>
					<div className="rounded-lg w-full col-span-1 space-y-3">
						<h4 className="text-base font-semibold">{t("features")}</h4>
						<ArticulatoryFeatures articulation={articulation} />
					</div>
				</div>
			</PhonemeSectionContent>

			{/* // TODO: Add steps and pitfalls after refining */}
		</PhonemeSection>
	);
}

type ArticulationIllustrationProps = {
	phonemeId: PhonemeSymbolId;
	articulation: PhonemeArticulation;
};

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

// TODO: Add the illustrations for the remaining categories
function ArticulationIllustration({ phonemeId, articulation }: ArticulationIllustrationProps) {
	const { label: phonemeLabel } = phonemeDetailsById[phonemeId];
	const { ipa: phonemeIpa } = allPhonemeSymbols[phonemeId];

	if (articulation.category === "consonant") {
		return (
			<div className="space-y-3">
				<AspectRatio ratio={1} className="bg-neutral-900/60 rounded-lg overflow-hidden">
					<Image
						src={`${BUCKET_URL}/diagrams/${phonemeId}.svg`}
						alt={`${phonemeLabel} articulation`}
						fill
						className="object-cover"
					/>
				</AspectRatio>
			</div>
		);
	}

	if (articulation.category === "vowel/monophthong" || articulation.category === "vowel/rhotic") {
		return (
			<div className="space-y-3">
				<VowelChartCard
					chartId={phonemeId}
					phonemeLabel={phonemeLabel}
					phonemeIpa={phonemeIpa}
					category={articulation.category}
					features={articulation.features}
				/>
			</div>
		);
	}

	if (articulation.category === "vowel/diphthong") {
		return (
			<div className="space-y-3">
				<VowelChartCard
					chartId={phonemeId}
					phonemeLabel={phonemeLabel}
					phonemeIpa={phonemeIpa}
					category={articulation.category}
					features={articulation.features}
				/>
			</div>
		);
	}

	return null;
}

type ArticulatoryFeaturesProps = {
	articulation: PhonemeArticulation;
};

function ArticulatoryFeatures({ articulation }: ArticulatoryFeaturesProps) {
	if (articulation.category === "consonant") {
		return (
			<div className="flex flex-wrap gap-2">
				<FeatureRow feature={featureDefinitions.manner} valueKey={articulation.features.manner} />
				<FeatureRow feature={featureDefinitions.place} valueKey={articulation.features.place} />
				<FeatureRow feature={featureDefinitions.voicing} valueKey={articulation.features.voicing} />
			</div>
		);
	}

	if (articulation.category === "vowel/monophthong" || articulation.category === "vowel/rhotic") {
		return (
			<div className="flex flex-wrap gap-2">
				<FeatureRow feature={featureDefinitions.height} valueKey={articulation.features.height} />
				<FeatureRow
					feature={featureDefinitions.backness}
					valueKey={articulation.features.backness}
				/>
				<FeatureRow
					feature={featureDefinitions.roundness}
					valueKey={articulation.features.roundness}
				/>
				<FeatureRow
					feature={featureDefinitions.tenseness}
					valueKey={articulation.features.tenseness}
				/>
			</div>
		);
	}

	if (articulation.category === "vowel/diphthong") {
		const features = articulation.features;
		const changingFeatures = [];

		// Only show features where the start and end values differ
		if (features.height !== features.targetHeight) {
			changingFeatures.push(
				<DiphthongFeatureRow
					key="height"
					feature={featureDefinitions.height}
					valueKey={features.height}
					targetFeature={diphthongTargetDefinitions.targetHeight}
					targetValueKey={features.targetHeight}
				/>,
			);
		}

		if (features.backness !== features.targetBackness) {
			changingFeatures.push(
				<DiphthongFeatureRow
					key="backness"
					feature={featureDefinitions.backness}
					valueKey={features.backness}
					targetFeature={diphthongTargetDefinitions.targetBackness}
					targetValueKey={features.targetBackness}
				/>,
			);
		}

		if (features.roundness !== features.targetRoundness) {
			changingFeatures.push(
				<DiphthongFeatureRow
					key="roundness"
					feature={featureDefinitions.roundness}
					valueKey={features.roundness}
					targetFeature={diphthongTargetDefinitions.targetRoundness}
					targetValueKey={features.targetRoundness}
				/>,
			);
		}

		return <div className="flex flex-wrap gap-2">{changingFeatures}</div>;
	}

	return null;
}

function FeatureRow<ValueKey extends string>({
	feature,
	valueKey,
}: {
	feature: ArticulatoryFeature<ValueKey>;
	valueKey: ValueKey;
}) {
	const value = feature.values[valueKey];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Pressable
					size="fit"
					variant="outline"
					className="flex flex-col rounded-lg p-2 gap-1 min-w-24"
				>
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						{feature.label}
					</span>
					<span className="text-xs font-medium">{value.label}</span>
				</Pressable>
			</PopoverTrigger>
			<PopoverContent className="p-3 max-w-xs" align="start">
				<dl className="space-y-3">
					<div>
						<dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
							{feature.label}
						</dt>
						<dd className="text-xs text-muted-foreground/80 leading-relaxed">
							{feature.description}
						</dd>
					</div>
					<Separator />
					<div className="bg-accent/30 rounded-md p-2.5 -mx-0.5">
						<dt className="text-xs font-semibold mb-1.5">{value.label}</dt>
						<dd className="text-xs text-muted-foreground leading-relaxed">{value.description}</dd>
					</div>
				</dl>
			</PopoverContent>
		</Popover>
	);
}

function DiphthongFeatureRow<ValueKey extends string>({
	feature,
	valueKey,
	targetFeature,
	targetValueKey,
}: {
	feature: ArticulatoryFeature<ValueKey>;
	valueKey: ValueKey;
	targetFeature: ArticulatoryFeature<ValueKey>;
	targetValueKey: ValueKey;
}) {
	const startValue = feature.values[valueKey];
	const endValue = targetFeature.values[targetValueKey];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Pressable
					size="fit"
					variant="outline"
					className="flex flex-col items-start rounded-lg p-2 gap-1 min-w-24"
				>
					<span className="text-xs font-semibold text-muted-foreground tracking-wide">
						{feature.label}
					</span>
					<div className="flex items-center gap-1 text-xs font-medium">
						<span>{startValue.label}</span>
						<ArrowRightIcon className="size-3 text-muted-foreground" />
						<span>{endValue.label}</span>
					</div>
				</Pressable>
			</PopoverTrigger>
			<PopoverContent className="p-2" align="start">
				<dl className="space-y-3">
					<div>
						<dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
							{feature.label}
						</dt>
						<dd className="text-xs text-muted-foreground/80 leading-relaxed">
							{feature.description}
						</dd>
					</div>
					<Separator />
					<div className="bg-accent/20 rounded-lg p-2 space-y-2">
						<div>
							<dt className="text-xs font-semibold mb-1">{startValue.label}</dt>
							<dd className="text-xs text-muted-foreground leading-relaxed">
								{startValue.description}
							</dd>
						</div>
						<div className="flex items-center justify-center text-muted-foreground">
							<ArrowDownIcon className="size-4" />
						</div>
						<div>
							<dt className="text-xs font-semibold mb-1">{endValue.label}</dt>
							<dd className="text-xs text-muted-foreground leading-relaxed">
								{endValue.description}
							</dd>
						</div>
					</div>
				</dl>
			</PopoverContent>
		</Popover>
	);
}
