import Image from "next/image";
import { type ConsonantArticulatoryFeatures, phonemeArticulations } from "shared-data";
import { useScopedI18n } from "@/locales/client";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
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
		}
	}

	return (
		<section className="space-y-3 px-3 sm:px-4">
			<h3 className="text-base font-bold">{tc("pronunciation")}</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="flex items-start justify-center">
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
							{tc("articulation")}
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
		<div className="space-y-1.5">
			<FeatureRow feature="manner" value={features.manner} />
			<FeatureRow feature="place" value={features.place} />
			<FeatureRow feature="voicing" value={features.voicing} />
		</div>
	);
}

function FeatureRow({
	feature,
	value,
}: {
	feature: keyof ConsonantArticulatoryFeatures;
	value: ConsonantArticulatoryFeatures[keyof ConsonantArticulatoryFeatures];
}) {
	const t = useScopedI18n(
		`components.phoneme-details.common.articulation.features.list.${feature}`,
	);
	const featureLabel = t("label");
	const featureDescription = t("description");

	const valueLabel = t(`list.${value}.label`);
	const valueDescription = t(`list.${value}.description`);

	return (
		<Tooltip>
			<div className="flex items-center gap-2">
				<span className="text-xs text-muted-foreground/80 font-semibold w-20 shrink-0">
					{featureLabel}:
				</span>
				<TooltipTrigger asChild>
					<Badge variant="secondary" className="font-medium cursor-help text-xs px-2 py-0.5">
						{valueLabel}
					</Badge>
				</TooltipTrigger>
			</div>
			<TooltipContent className="max-w-xs">
				<p className="text-xs">{featureDescription}</p>
				<p className="text-xs">{valueDescription}</p>
			</TooltipContent>
		</Tooltip>
	);
}
