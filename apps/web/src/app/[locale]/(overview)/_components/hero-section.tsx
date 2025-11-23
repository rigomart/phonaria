import { getScopedI18n } from "@/locales/server";
import { HeroPhonemeDemo } from "./hero-phoneme-demo";

export async function HeroSection() {
	const t = await getScopedI18n("overview-page.hero");

	return (
		<section className="border-b border-border/60 bg-linear-120 from-background-strong to-background">
			<div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
				<div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center max-w-7xl mx-auto">
					<div className="space-y-3 lg:space-y-4">
						<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
							{t("title")}
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
							{t("description")}
						</p>
					</div>

					<HeroPhonemeDemo />
				</div>
			</div>
		</section>
	);
}
