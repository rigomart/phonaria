import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { getScopedI18n } from "@/locales/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getScopedI18n("credits-page.meta");
	return {
		title: t("title"),
		description: t("description"),
	};
}

export default async function CreditsPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setStaticParamsLocale(locale);

	const t = await getScopedI18n("credits-page");

	return (
		<div className="flex flex-1 flex-col bg-background overflow-y-auto">
			<div className="container mx-auto p-4 py-6 sm:p-6 lg:p-8 max-w-4xl">
				<h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
				<p className="text-muted-foreground mb-8">{t("description")}</p>

				<div className="space-y-8">
					{/* Wikimedia Commons Audio Samples */}
					<section className="space-y-3">
						<h2 className="text-xl font-semibold">{t("sections.wikimedia.title")}</h2>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{t("sections.wikimedia.content")}
						</p>
						<a
							href={t("sections.wikimedia.link-url")}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block text-sm text-primary hover:underline"
						>
							{t("sections.wikimedia.link-text")} →
						</a>
					</section>

					{/* CMU Pronouncing Dictionary */}
					<section className="space-y-3">
						<h2 className="text-xl font-semibold">{t("sections.cmu.title")}</h2>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{t("sections.cmu.content")}
						</p>
						<a
							href={t("sections.cmu.link-url")}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block text-sm text-primary hover:underline"
						>
							{t("sections.cmu.link-text")} →
						</a>
					</section>

					{/* Phonetic Data Sources */}
					<section className="space-y-3">
						<h2 className="text-xl font-semibold">{t("sections.phonetic-data.title")}</h2>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{t("sections.phonetic-data.content")}
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
