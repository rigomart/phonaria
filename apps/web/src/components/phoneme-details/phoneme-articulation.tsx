import Image from "next/image";
import {
	type ConsonantArticulatoryFeatures,
	phonemeArticulations,
	type VowelArticulatoryFeatures,
} from "shared-data";
import {
	type ArticulatoryFeature,
	consonantFeatureDefinitions,
	phonemeDetailsById,
	vowelFeatureDefinitions,
} from "@/data/phoneme-details";
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
	const { label: phonemeLabel } = phonemeDetailsById[phonemeId];

	const tc = useScopedI18n(`components.phoneme-details.articulation`);

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
							alt={`${phonemeLabel} articulation`}
							fill
							className="object-contain"
						/>
					</AspectRatio>
				</div>

				<div className="space-y-3">
					<div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							{tc("features")}
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
	return (
		<div className="flex flex-col gap-2 w-36">
			<FeatureRow feature={consonantFeatureDefinitions.manner} valueKey={features.manner} />
			<FeatureRow feature={consonantFeatureDefinitions.place} valueKey={features.place} />
			<FeatureRow feature={consonantFeatureDefinitions.voicing} valueKey={features.voicing} />
		</div>
	);
}

function MonophthongArticulationFeatures({ features }: { features: VowelArticulatoryFeatures }) {
	return (
		<div className="flex flex-col gap-2 w-36">
			<FeatureRow feature={vowelFeatureDefinitions.height} valueKey={features.height} />
			<FeatureRow feature={vowelFeatureDefinitions.backness} valueKey={features.backness} />
			<FeatureRow feature={vowelFeatureDefinitions.roundness} valueKey={features.roundness} />
			<FeatureRow feature={vowelFeatureDefinitions.tenseness} valueKey={features.tenseness} />
		</div>
	);
}

function FeatureRow<ValueKey extends string>({
	feature,
	valueKey,
}: {
	feature: ArticulatoryFeature<ValueKey>;
	valueKey: ValueKey;
}) {
	const value = feature.values[valueKey];

	if (!value) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<Popover>
				<PopoverTrigger asChild>
					<Pressable size="fit" variant="outline" className="flex rounded-full gap-2 justify-start">
						<Badge
							className="text-xs font-semibold rounded-full"
							variant="secondary"
							title="Open details"
							aria-label="Open details"
						>
							{feature.label}
						</Badge>
						<span className="text-xs text-muted-foreground">{value.label}</span>
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
