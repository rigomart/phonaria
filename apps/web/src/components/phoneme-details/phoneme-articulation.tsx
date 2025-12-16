import {
	getIpaForPhonemeId,
	type PhonemeArticulation,
	PhonemeArticulationRegistry,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { AspectRatio } from "@phonaria/ui/components/aspect-ratio";
import { Button } from "@phonaria/ui/components/button";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ArticulatoryFeature, PhonemeDetailsCopy } from "@/data/phoneme-details";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { Link } from "@/i18n/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Pressable } from "../ui/pressable";
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

	const articulation = PhonemeArticulationRegistry[phonemeId];
	const { phonemeDetailsById, featureDefinitions, diphthongTargetDefinitions } =
		usePhonemeDetailsCopy();
	const phonemeLabel = phonemeDetailsById[phonemeId].label;

	const t = useTranslations(`components.phoneme-details.articulation`);

	return (
		<PhonemeSection>
			<PhonemeSectionHeader>
				<PhonemeSectionTitle>{t("title")}</PhonemeSectionTitle>
				<PhonemeSectionDescription>{t("description")}</PhonemeSectionDescription>
			</PhonemeSectionHeader>
			<PhonemeSectionContent>
				<div className="flex flex-col items-start gap-1">
					<div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div className="col-span-2">
							<ArticulationIllustration
								phonemeId={phonemeId}
								phonemeLabel={phonemeLabel}
								articulation={articulation}
							/>
						</div>
						<div className="rounded-lg w-full col-span-1 space-y-3">
							<h4 className="text-sm sm:text-base font-semibold">{t("features")}</h4>
							<ArticulatoryFeatures
								articulation={articulation}
								featureDefinitions={featureDefinitions}
								diphthongTargetDefinitions={diphthongTargetDefinitions}
							/>
						</div>
					</div>
					<Button
						size="xs"
						variant="link"
						render={
							<Link href="/ipa-chart">
								{t("ipa-chart-link")}
								<ArrowRightIcon className="size-4" aria-hidden="true" />
							</Link>
						}
					/>
				</div>
			</PhonemeSectionContent>

			{/* // TODO: Add steps and pitfalls after refining */}
		</PhonemeSection>
	);
}

type ArticulationIllustrationProps = {
	phonemeId: PhonemeSymbolId;
	phonemeLabel: string;
	articulation: PhonemeArticulation;
};

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

function ArticulationIllustration({
	phonemeId,
	phonemeLabel,
	articulation,
}: ArticulationIllustrationProps) {
	const phonemeIpa = getIpaForPhonemeId(phonemeId);

	if (articulation.category === "consonant") {
		return (
			<AspectRatio ratio={1} className="bg-neutral-900/60 rounded-lg overflow-hidden">
				<Image
					src={`${BUCKET_URL}/diagrams/${phonemeId}.svg`}
					alt={`${phonemeLabel} articulation`}
					fill
					className="object-cover"
				/>
			</AspectRatio>
		);
	}

	if (articulation.vowelType === "monophthong") {
		return (
			<VowelChartCard
				chartId={phonemeId}
				phonemeLabel={phonemeLabel}
				phonemeIpa={phonemeIpa}
				vowelType={articulation.vowelType}
				features={articulation.features}
			/>
		);
	}

	if (articulation.vowelType === "diphthong") {
		return (
			<VowelChartCard
				chartId={phonemeId}
				phonemeLabel={phonemeLabel}
				phonemeIpa={phonemeIpa}
				vowelType={articulation.vowelType}
				features={articulation.features}
			/>
		);
	}

	return null;
}

type ArticulatoryFeaturesProps = {
	articulation: PhonemeArticulation;
	featureDefinitions: PhonemeDetailsCopy["featureDefinitions"];
	diphthongTargetDefinitions: PhonemeDetailsCopy["diphthongTargetDefinitions"];
};

function ArticulatoryFeatures({
	articulation,
	featureDefinitions,
	diphthongTargetDefinitions,
}: ArticulatoryFeaturesProps) {
	if (articulation.category === "consonant") {
		return (
			<div className="flex flex-wrap gap-2">
				<FeatureRow feature={featureDefinitions.manner} valueKey={articulation.features.manner} />
				<FeatureRow feature={featureDefinitions.place} valueKey={articulation.features.place} />
				<FeatureRow feature={featureDefinitions.voicing} valueKey={articulation.features.voicing} />
			</div>
		);
	}

	if (articulation.vowelType === "monophthong") {
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
				{articulation.features.rhoticity ? (
					<FeatureRow
						feature={featureDefinitions.rhoticity}
						valueKey={articulation.features.rhoticity}
					/>
				) : null}
			</div>
		);
	}

	if (articulation.vowelType === "diphthong") {
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

	const { contentRef } = usePhonemeDetailsContext();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Pressable
					size="default"
					variant="outline"
					className="sm:flex-col items-start gap-1 sm:w-full"
				>
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						{feature.label}
					</span>
					<span className="text-xs font-medium">{value.label}</span>
				</Pressable>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom" collisionBoundary={contentRef.current}>
				<div className="space-y-3">
					<div className="rounded-lg border bg-muted p-2">
						<p className="text-sm font-semibold leading-none">{feature.label}</p>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
							{feature.description}
						</p>
					</div>

					<div className="pl-3 border-l-2 border-border">
						<div className="flex items-center gap-1">
							<ArrowRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
							<span className="text-sm font-semibold leading-none">{value.label}</span>
						</div>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
							{value.description}
						</p>
					</div>
				</div>
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

	const { contentRef } = usePhonemeDetailsContext();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Pressable
					size="default"
					variant="outline"
					className="sm:flex-col items-start gap-1 sm:w-full"
				>
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						{feature.label}
					</span>
					<div className="flex items-center gap-1 text-xs font-medium">
						<span>{startValue.label}</span>
						<ArrowRightIcon className="size-3 text-muted-foreground" />
						<span>{endValue.label}</span>
					</div>
				</Pressable>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom" collisionBoundary={contentRef.current}>
				<div className="space-y-3">
					<div className="rounded-lg border bg-muted p-2">
						<p className="text-sm font-semibold leading-none">{feature.label}</p>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
							{feature.description}
						</p>
					</div>

					<div className="pl-3 border-l-2 border-border space-y-2">
						<div className="flex items-center gap-1">
							<span className="text-sm font-semibold leading-none">{startValue.label}</span>
							<ArrowRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
							<span className="text-sm font-semibold leading-none">{endValue.label}</span>
						</div>

						<div className="space-y-2">
							<div className="rounded-lg border p-2">
								<p className="text-xs font-semibold">{startValue.label}</p>
								<p className="mt-1 text-xs text-muted-foreground leading-relaxed">
									{startValue.description}
								</p>
							</div>
							<div className="flex items-center justify-center text-muted-foreground">
								<ArrowDownIcon className="size-4" aria-hidden="true" />
							</div>
							<div className="rounded-lg border p-2">
								<p className="text-xs font-semibold">{endValue.label}</p>
								<p className="mt-1 text-xs text-muted-foreground leading-relaxed">
									{endValue.description}
								</p>
							</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
