import { Separator } from "@phonaria/ui/components/separator";
import { BarChart3, BookOpen, Mic, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { ContrastDemoSection } from "./_components/contrast-demo-section";
import { IpaVisualizerSection } from "./_components/ipa-visualizer-section";
import { SpellingVsSoundSection } from "./_components/spelling-vs-sound-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "overview-page" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, ""),
			languages: getLanguageAlternates(""),
		},
	};
}

export default async function OverviewPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);

	return (
		<div className="flex flex-1 flex-col bg-muted/10 items-center">
			<div className="w-full max-w-5xl my-6 md:my-12 bg-card rounded-xl border shadow-sm p-6 md:p-12 space-y-12">
				<header className="space-y-3 pb-2">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						English Phonetics Toolkit
					</h1>
					<p className="text-muted-foreground leading-relaxed max-w-2xl">
						Interactive tools and references to help you decode English spelling and master
						pronunciation.
					</p>
				</header>

				<Separator />

				<SpellingVsSoundSection />
				<Separator />
				<IpaVisualizerSection />
				<Separator />
				<ContrastDemoSection />

				<Separator />

				<section className="space-y-6">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold tracking-tight">Toolkit</h2>
						<p className="text-sm text-muted-foreground">Direct access to the application tools.</p>
					</div>

					<div className="grid sm:grid-cols-2 gap-4">
						<Link
							href="/transcription"
							className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:bg-muted/50 hover:border-border/50 transition-all"
						>
							<div className="p-2 bg-muted/50 rounded-md text-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
								<Mic className="size-4" />
							</div>
							<div className="space-y-1">
								<div className="font-medium text-sm group-hover:text-primary transition-colors">
									Transcription Studio
								</div>
								<div className="text-xs text-muted-foreground leading-relaxed">
									Convert text to IPA with stress markers and dictionary lookup.
								</div>
							</div>
						</Link>

						<Link
							href="/ipa-chart"
							className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:bg-muted/50 hover:border-border/50 transition-all"
						>
							<div className="p-2 bg-muted/50 rounded-md text-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
								<BookOpen className="size-4" />
							</div>
							<div className="space-y-1">
								<div className="font-medium text-sm group-hover:text-primary transition-colors">
									IPA Reference
								</div>
								<div className="text-xs text-muted-foreground leading-relaxed">
									Interactive chart with articulation details and audio.
								</div>
							</div>
						</Link>

						<Link
							href="/find-by-sound"
							className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:bg-muted/50 hover:border-border/50 transition-all"
						>
							<div className="p-2 bg-muted/50 rounded-md text-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
								<Search className="size-4" />
							</div>
							<div className="space-y-1">
								<div className="font-medium text-sm group-hover:text-primary transition-colors">
									Find by Sound
								</div>
								<div className="text-xs text-muted-foreground leading-relaxed">
									Search for words by selecting phonemes.
								</div>
							</div>
						</Link>

						<Link
							href="/insights"
							className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:bg-muted/50 hover:border-border/50 transition-all"
						>
							<div className="p-2 bg-muted/50 rounded-md text-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
								<BarChart3 className="size-4" />
							</div>
							<div className="space-y-1">
								<div className="font-medium text-sm group-hover:text-primary transition-colors">
									Insights
								</div>
								<div className="text-xs text-muted-foreground leading-relaxed">
									Corpus statistics and phoneme frequency data.
								</div>
							</div>
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
