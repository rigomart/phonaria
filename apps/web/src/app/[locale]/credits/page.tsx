import { Badge } from "@phonaria/ui/components/badge";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { type Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { routing } from "@/i18n/routing";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({ locale, namespace: "credits-page" });

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, "/credits"),
			languages: getLanguageAlternates("/credits"),
		},
	};
}

type CreditCardProps = {
	title: string;
	content: string;
	link?: {
		text: string;
		url: string;
	};
	license?: {
		text: string;
		url: string;
	};
};

function CreditCard({ title, content, link, license }: CreditCardProps) {
	return (
		<div className="flex flex-col rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 overflow-hidden h-full">
			<div className="p-4">
				<h2 className="text-base font-semibold tracking-tight">{title}</h2>
				<p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{content}</p>
			</div>

			{(link || license) && (
				<div className="mt-auto border-t border-border/50 bg-muted/30 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
					{link && (
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
						>
							{link.text}
							<ExternalLink className="size-3.5" />
						</a>
					)}
					{license && (
						<a
							href={license.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
						>
							<Badge variant="outline" className="font-normal">
								{license.text}
							</Badge>
						</a>
					)}
				</div>
			)}
		</div>
	);
}

export default function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
	const { locale } = use(params);

	setRequestLocale(locale as Locale);

	const t = useTranslations("credits-page");

	const credits = [
		{
			key: "wikimedia",
			link: { text: t("sections.wikimedia.link-text"), url: t("sections.wikimedia.link-url") },
		},
		{
			key: "sagittal",
			link: { text: t("sections.sagittal.link-text"), url: t("sections.sagittal.link-url") },
			license: { text: "CC BY-SA 4.0", url: t("sections.sagittal.license-url") },
		},
		{
			key: "cmu",
			link: { text: t("sections.cmu.link-text"), url: t("sections.cmu.link-url") },
			license: { text: "BSD", url: "https://github.com/cmusphinx/cmudict/blob/master/LICENSE" },
		},
		{
			key: "wordfreq",
			link: { text: t("sections.wordfreq.link-text"), url: t("sections.wordfreq.link-url") },
			license: { text: "CC BY-SA 4.0", url: t("sections.wordfreq.license-url") },
		},
		{
			key: "free-dictionary",
			link: {
				text: t("sections.free-dictionary.link-text"),
				url: t("sections.free-dictionary.link-url"),
			},
			license: { text: "CC BY-SA 3.0", url: t("sections.free-dictionary.license-url") },
		},
		{
			key: "example-audio",
		},
		{
			key: "phonetic-data",
		},
	] as const;

	return (
		<div className="flex flex-1 flex-col bg-background">
			<div className="container mx-auto p-4 sm:p-6 max-w-6xl space-y-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("title")}</h1>
					<p className="text-sm text-muted-foreground">{t("description")}</p>
				</div>

				<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{credits.map((credit) => (
						<CreditCard
							key={credit.key}
							title={t(`sections.${credit.key}.title`)}
							content={t(`sections.${credit.key}.content`)}
							link={"link" in credit ? credit.link : undefined}
							license={"license" in credit ? credit.license : undefined}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
