import { getScopedI18n } from "@/locales/server";
import { FeatureCard, featureCards } from "./feature-card";

export async function CoreModulesSection() {
	const t = await getScopedI18n("overview-page.core-modules-section");

	return (
		<section className="border-b border-border/60">
			<div className="container mx-auto px-4 py-12 lg:px-6">
				<div className="grid gap-8">
					<div className="max-w-2xl">
						<h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
						<p className="mt-2 text-base text-muted-foreground">{t("description")}</p>
					</div>
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{featureCards.map((feature) => (
							<FeatureCard key={feature.id} feature={feature} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
