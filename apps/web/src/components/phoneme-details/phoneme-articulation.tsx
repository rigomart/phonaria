import { EllipsisVerticalIcon } from "lucide-react";
import Image from "next/image";
import { type PhonemeArticulation, type PhonemeSymbolId, phonemeArticulations } from "shared-data";
import {
	type ArticulatoryFeature,
	featureDefinitions,
	phonemeDetailsById,
} from "@/data/phoneme-details";
import { useScopedI18n } from "@/locales/client";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
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
				<div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-2">
					<div className="col-span-2">
						<ArticulationIllustration category={articulation.category} phonemeId={phonemeId} />
					</div>
					<div className="rounded-lg w-full col-span-1 space-y-2">
						<h4 className="text-sm font-bold">{t("features")}</h4>
						<ArticulatoryFeatures articulation={articulation} />
					</div>
				</div>
			</PhonemeSectionContent>

			{/* // TODO: Add steps and pitfalls after refining */}
		</PhonemeSection>
	);
}

type ArticulationIllustrationProps = {
	category: PhonemeArticulation["category"];
	phonemeId: PhonemeSymbolId;
};

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

// TODO: Add the illustrations for the remaining categories
function ArticulationIllustration({ category, phonemeId }: ArticulationIllustrationProps) {
	const { label: phonemeLabel } = phonemeDetailsById[phonemeId];

	if (category === "consonant") {
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

	if (category === "vowel/monophthong") {
		return (
			<div className="bg-neutral-950/80 rounded-lg">
				<p className="text-xs text-muted-foreground">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
				</p>
			</div>
		);
	}
}

type ArticulatoryFeaturesProps = {
	articulation: PhonemeArticulation;
};

// TODO: Add the features for the remaining categories
function ArticulatoryFeatures({ articulation }: ArticulatoryFeaturesProps) {
	if (articulation.category === "consonant") {
		return (
			<div className="flex flex-wrap gap-x-2 gap-y-3">
				<FeatureRow feature={featureDefinitions.manner} valueKey={articulation.features.manner} />
				<FeatureRow feature={featureDefinitions.place} valueKey={articulation.features.place} />
				<FeatureRow feature={featureDefinitions.voicing} valueKey={articulation.features.voicing} />
			</div>
		);
	}

	if (articulation.category === "vowel/monophthong" || articulation.category === "vowel/rhotic") {
		return (
			<div className="flex flex-wrap gap-x-2 gap-y-3">
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
		<div className="flex flex-col">
			<Popover>
				<PopoverTrigger asChild>
					<Pressable size="fit" variant="outline" className="flex rounded-full justify-start gap-2">
						<Badge
							className="text-xs font-semibold rounded-full"
							variant="secondary"
							title="Open details"
							aria-label="Open details"
						>
							{feature.label}:
						</Badge>
						<span className="text-xs text-muted-foreground">{value.label}</span>
						<EllipsisVerticalIcon className="size-3 mr-1" />
					</Pressable>
				</PopoverTrigger>
				<PopoverContent className="p-2" align="start">
					<dl className="space-y-2">
						<div>
							<dt className="font-semibold text-sm mb-1">{feature.label}</dt>
							<dd className="text-xs text-muted-foreground">{feature.description}</dd>
						</div>

						<Separator />

						<div className="p-2 bg-primary/10 rounded-md border border-primary/10">
							<dt className="text-xs font-semibold mb-1">{value.label}</dt>
							<dd className="text-xs text-muted-foreground">{value.description}</dd>
						</div>
					</dl>
				</PopoverContent>
			</Popover>
		</div>
	);
}
