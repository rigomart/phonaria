import Image from "next/image";
import {
	type ConsonantArticulatoryFeatures,
	phonemeArticulations,
	type VowelArticulatoryFeatures,
} from "shared-data";
import { useScopedI18n } from "@/locales/client";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Pressable } from "../ui/pressable";
import { Separator } from "../ui/separator";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

export function PhonemeDetailsArticulation() {
	const { phonemeId } = usePhonemeDetailsContext();

	const articulation = phonemeArticulations[phonemeId];

	const tc = useScopedI18n(`components.phoneme-details.common.articulation`);

	const t = useScopedI18n(`components.phoneme-details.phonemes.${phonemeId}`);

	function ArticulationFeatures() {
		switch (articulation.category) {
			case "consonant":
				return <ConsonantArticulationFeatures features={articulation.features} />;
			case "vowel/monophthong":
				return <MonophthongArticulationFeatures features={articulation.features} />;
		}
	}

	return (
		<section className="space-y-3 px-3 sm:px-4">
			<h3 className="text-base font-bold">{tc("pronunciation")}</h3>
			<div className="gap-4 flex">
				<div className="flex items-start justify-center flex-1">
					<AspectRatio ratio={1} className="bg-neutral-950/80 rounded-lg">
						<Image
							src={`${bucketUrl}/${phonemeId}.svg`}
							alt={`${t("label")} articulation`}
							fill
							className="object-contain"
						/>
					</AspectRatio>
				</div>

				<div className="space-y-3">
					<div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							{tc("features-label")}
						</h4>
						<ArticulationFeatures />
					</div>

					{/* //TODO: Add locale for steps */}
					{/* <div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							{tc("step-by-step")}
						</h4>
						<ol className="space-y-1 text-xs">
							{t("steps")
								.split("|")
								.map((step, i) => (
									<li key={step} className="flex gap-1.5">
										<span className="text-primary font-semibold shrink-0">{i + 1}.</span>
										<span className="text-foreground">{step}</span>
									</li>
								))}
						</ol>
					</div> */}

					{/* //TODO: Add locale for pitfalls */}
					{/* <div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							{tc("common-mistakes")}
						</h4>
						<div className="space-y-1">
							{t("pitfalls")((pitfall) => (
								<Popover key={pitfall.summary}>
									<PopoverTrigger asChild>
										<button
											type="button"
											className="w-full text-left px-2 py-1.5 rounded-md border hover:bg-muted/50 transition-colors text-xs"
										>
											<span className="text-foreground font-semibold">‣ {pitfall.summary}</span>
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-80 text-xs" align="start">
										<p className="text-muted-foreground">{pitfall.tip}</p>
									</PopoverContent>
								</Popover>
							))}
						</div>
					</div> */}
				</div>
			</div>
		</section>
	);
}

function ConsonantArticulationFeatures({ features }: { features: ConsonantArticulatoryFeatures }) {
	const t = useScopedI18n("components.phoneme-details.common.articulation.features.list");

	const mannerLabel = t("manner.label");
	const mannerDescription = t("manner.description");
	const mannerValueLabel = t(`manner.list.${features.manner}.label`);
	const mannerValueDescription = t(`manner.list.${features.manner}.description`);

	const placeLabel = t("place.label");
	const placeDescription = t("place.description");
	const placeValueLabel = t(`place.list.${features.place}.label`);
	const placeValueDescription = t(`place.list.${features.place}.description`);

	const voicingLabel = t("voicing.label");
	const voicingDescription = t("voicing.description");
	const voicingValueLabel = t(`voicing.list.${features.voicing}.label`);
	const voicingValueDescription = t(`voicing.list.${features.voicing}.description`);

	return (
		<div className="flex flex-col gap-2 w-30">
			<FeatureRow
				featureLabel={mannerLabel}
				featureDescription={mannerDescription}
				valueLabel={mannerValueLabel}
				valueDescription={mannerValueDescription}
			/>
			<FeatureRow
				featureLabel={placeLabel}
				featureDescription={placeDescription}
				valueLabel={placeValueLabel}
				valueDescription={placeValueDescription}
			/>
			<FeatureRow
				featureLabel={voicingLabel}
				featureDescription={voicingDescription}
				valueLabel={voicingValueLabel}
				valueDescription={voicingValueDescription}
			/>
		</div>
	);
}

function MonophthongArticulationFeatures({ features }: { features: VowelArticulatoryFeatures }) {
	const t = useScopedI18n("components.phoneme-details.common.articulation.features.list");

	const heightLabel = t("height.label");
	const heightDescription = t("height.description");
	const heightValueLabel = t(`height.list.${features.height}.label`);
	const heightValueDescription = t(`height.list.${features.height}.description`);

	const backnessLabel = t("backness.label");
	const backnessDescription = t("backness.description");
	const backnessValueLabel = t(`backness.list.${features.backness}.label`);
	const backnessValueDescription = t(`backness.list.${features.backness}.description`);

	const roundnessLabel = t("roundness.label");
	const roundnessDescription = t("roundness.description");
	const roundnessValueLabel = t(`roundness.list.${features.roundness}.label`);
	const roundnessValueDescription = t(`roundness.list.${features.roundness}.description`);

	const tensenessLabel = t("tenseness.label");
	const tensenessDescription = t("tenseness.description");
	const tensenessValueLabel = t(`tenseness.list.${features.tenseness}.label`);
	const tensenessValueDescription = t(`tenseness.list.${features.tenseness}.description`);

	return (
		<div className="flex flex-col gap-2 w-30">
			<FeatureRow
				featureLabel={heightLabel}
				featureDescription={heightDescription}
				valueLabel={heightValueLabel}
				valueDescription={heightValueDescription}
			/>
			<FeatureRow
				featureLabel={backnessLabel}
				featureDescription={backnessDescription}
				valueLabel={backnessValueLabel}
				valueDescription={backnessValueDescription}
			/>
			<FeatureRow
				featureLabel={roundnessLabel}
				featureDescription={roundnessDescription}
				valueLabel={roundnessValueLabel}
				valueDescription={roundnessValueDescription}
			/>
			<FeatureRow
				featureLabel={tensenessLabel}
				featureDescription={tensenessDescription}
				valueLabel={tensenessValueLabel}
				valueDescription={tensenessValueDescription}
			/>
		</div>
	);
}

function FeatureRow({
	featureLabel,
	featureDescription,
	valueLabel,
	valueDescription,
}: {
	featureLabel: string;
	featureDescription: string;
	valueLabel: string;
	valueDescription: string;
}) {

	return (
		<div className="flex flex-col">
			<Popover>
				<PopoverTrigger asChild>
					<Pressable variant="outline" className="flex flex-col">
						<Badge
							variant="secondary"
							className="font-medium cursor-pointer text-xs px-2 py-0.5 transition-colors"
							title="Open details"
							aria-label="Open details"
						>
							{featureLabel}
						</Badge>
						<span className="text-xs text-muted-foreground">{valueLabel}</span>
					</Pressable>
				</PopoverTrigger>
				<PopoverContent className="p-2" align="start">
					<dl className="space-y-2">
						<div>
							<dt className="font-semibold text-sm mb-1">{featureLabel}</dt>
							<dd className="text-xs text-muted-foreground">{featureDescription}</dd>
						</div>

						<Separator />

						<div className="p-2 bg-primary/10 rounded-md border border-primary/10">
							<dt className="text-xs font-semibold mb-1">{valueLabel}</dt>
							<dd className="text-xs text-muted-foreground">{valueDescription}</dd>
						</div>
					</dl>
				</PopoverContent>
			</Popover>
		</div>
	);
}
