import { getScopedI18n } from "@/locales/server";
import { HeroPhonemeDemo } from "./hero-phoneme-demo";

export async function HeroSection() {
	const t = await getScopedI18n("overview-page.hero");

	return (
		<section className="border-b border-border/60 bg-background-soft">
			<div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
				<div className="grid gap-4 sm:gap-6 lg:grid-cols-2 items-center max-w-7xl mx-auto">
					<div className="space-y-3 lg:space-y-4">
						<h1 className="text-2xl md:text-3xl text-center md:text-left font-bold tracking-tight leading-tight">
							{t("title")}
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center md:text-left">
							{t("description")}
						</p>
					</div>

					<HeroPhonemeDemo />
				</div>
			</div>
		</section>
	);
}
