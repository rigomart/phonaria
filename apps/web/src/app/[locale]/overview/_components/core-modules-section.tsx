import { getScopedI18n } from "@/locales/server";
import { FeatureCard, type FeatureCardId, featureCards } from "./feature-card";

const featureHighlightKeys: Record<FeatureCardId, readonly string[]> = {
	g2p: [
		"feature-cards.g2p.highlights.input",
		"feature-cards.g2p.highlights.selection",
		"feature-cards.g2p.highlights.dictionary",
	],
	inspector: [
		"feature-cards.inspector.highlights.articulation",
		"feature-cards.inspector.highlights.patterns",
		"feature-cards.inspector.highlights.contrasts",
	],
	"ipa-chart": [
		"feature-cards.ipa-chart.highlights.layout",
		"feature-cards.ipa-chart.highlights.cells",
		"feature-cards.ipa-chart.highlights.keywords",
	],
};

export async function CoreModulesSection() {
	const t = await getScopedI18n("overview-page.core-modules-section");
	const actionLabel = t("action-label");

	return (
		<section className="border-b border-border/60">
			<div className="container mx-auto px-4 py-12 lg:px-6">
				<div className="grid gap-8">
					<div className="max-w-2xl">
						<h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
						<p className="mt-2 text-base text-muted-foreground">{t("description")}</p>
					</div>
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{featureCards.map((feature) => {
							const copyBase = `feature-cards.${feature.id}` as const;

							return (
								<FeatureCard
									key={feature.id}
									feature={feature}
									copy={{
										name: t(`${copyBase}.name`),
										tagline: t(`${copyBase}.tagline`),
										description: t(`${copyBase}.description`),
										highlights: featureHighlightKeys[
											feature.id
										].map((key) => t(key)),
										actionLabel,
									}}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
