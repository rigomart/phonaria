import Image from "next/image";
import {
	type ConsonantArticulatoryFeatures,
	type PhonemeSymbolId,
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

	const tc = useScopedI18n(`components.phoneme-details.articulation`);

	function ArticulationFeatures() {
		switch (articulation.category) {
			case "consonant":
				return <ConsonantArticulationFeatures features={articulation.features} />;
			case "vowel/monophthong":
				return <MonophthongArticulationFeatures features={articulation.features} />;
		}
	}

	function ArticulationIllustration() {
		switch (articulation.category) {
			case "consonant":
				return <ConsonantArticulationIllustration phonemeId={phonemeId} />;
			case "vowel/monophthong":
				return <VowelArticulationIllustration phonemeId={phonemeId} />;
		}
	}

	return (
		<section className="space-y-2 px-3 sm:px-4">
			<h3 className="text-base font-bold">{tc("pronunciation")}</h3>
			<div className="flex flex-col gap-2 w-full">
				<ArticulationFeatures />
				<div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
					<div className="col-span-2">
						<ArticulationIllustration />
					</div>
					<div className="rounded-lg w-full col-span-1">
						<p className="text-xs text-muted-foreground">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
						</p>
					</div>
				</div>
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
		</section>
	);
}

type ConsonantArticulationIllustrationProps = {
	phonemeId: PhonemeSymbolId;
};

function ConsonantArticulationIllustration({ phonemeId }: ConsonantArticulationIllustrationProps) {
	const { label: phonemeLabel } = phonemeDetailsById[phonemeId];
	return (
		<AspectRatio ratio={1} className="bg-neutral-950/80 rounded-lg">
			<Image
				src={`${bucketUrl}/${phonemeId}.svg`}
				alt={`${phonemeLabel} articulation`}
				fill
				className="object-cover"
			/>
		</AspectRatio>
	);
}

type VowelArticulationIllustrationProps = {
	phonemeId: PhonemeSymbolId;
};

function VowelArticulationIllustration({ phonemeId }: VowelArticulationIllustrationProps) {
	return (
		<div className="bg-neutral-950/80 rounded-lg">
			<p className="text-xs text-muted-foreground">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
			</p>
		</div>
	);
}

function ConsonantArticulationFeatures({ features }: { features: ConsonantArticulatoryFeatures }) {
	return (
		<div className="flex flex-wrap gap-1">
			<FeatureRow feature={consonantFeatureDefinitions.manner} valueKey={features.manner} />
			<FeatureRow feature={consonantFeatureDefinitions.place} valueKey={features.place} />
			<FeatureRow feature={consonantFeatureDefinitions.voicing} valueKey={features.voicing} />
		</div>
	);
}

function MonophthongArticulationFeatures({ features }: { features: VowelArticulatoryFeatures }) {
	return (
		<div className="flex flex-wrap gap-1">
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

	return (
		<div className="flex flex-col">
			<Popover>
				<PopoverTrigger asChild>
					<Pressable size="fit" variant="outline" className="flex rounded-full justify-start">
						<Badge
							className="text-xs font-semibold rounded-full"
							variant="secondary"
							title="Open details"
							aria-label="Open details"
						>
							{feature.label}:
						</Badge>
						<span className="text-xs text-muted-foreground px-2">{value.label}</span>
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
