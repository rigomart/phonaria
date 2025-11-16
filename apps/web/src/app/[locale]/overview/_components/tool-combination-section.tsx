import { Route, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getScopedI18n } from "@/locales/server";

const suggestionConfigs = [
	{
		id: "transcript-to-chart",
		icon: Sparkles,
		links: [
			{ key: "transcription", href: "/" },
			{ key: "ipa-chart", href: "/ipa-chart" },
		],
	},
	{
		id: "chart-to-examples",
		icon: Route,
		links: [
			{ key: "ipa-chart", href: "/ipa-chart" },
			{ key: "transcription", href: "/" },
		],
	},
];

export async function ToolCombinationSection() {
	const t = await getScopedI18n("overview-page.tool-combination-section");

	return (
		<section className="border-b border-border/60 bg-muted/40">
			<div className="container mx-auto px-4 py-12 lg:px-6">
				<div className="space-y-5">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
						<p className="text-base text-muted-foreground">{t("description")}</p>
					</div>
					<div className="grid gap-3">
						{suggestionConfigs.map((suggestion) => {
							const Icon = suggestion.icon;
							const suggestionBase = `suggestions.${suggestion.id}` as const;

							return (
								<div
									key={suggestion.id}
									className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-start"
								>
									<span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Icon className="size-5" aria-hidden="true" />
									</span>
									<div className="space-y-2">
										<div>
											<p className="font-semibold">{t(`${suggestionBase}.title`)}</p>
											<p className="text-sm text-muted-foreground">
												{t(`${suggestionBase}.description`)}
											</p>
										</div>
										<div className="flex flex-wrap gap-2">
											{suggestion.links.map((link) => (
												<Button
													key={`${suggestion.id}-${link.key}`}
													asChild
													variant="link"
													className="h-auto px-0 text-sm font-semibold text-primary"
												>
													<Link href={link.href}>
														{t(`${suggestionBase}.links.${link.key}`)}
													</Link>
												</Button>
											))}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
