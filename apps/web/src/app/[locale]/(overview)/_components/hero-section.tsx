import { hasLanguageFeature, TARGET_ACCENTS } from "@phonaria/phonetics-data";
import { Badge } from "@phonaria/ui/components/badge";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TOOL_DEFINITIONS } from "../_lib/tool-navigation";
import { ToolAccentLink } from "./tool-accent-link";

export async function HeroSection() {
	const t = await getTranslations("overview-page");
	const tCommon = await getTranslations("common");

	return (
		<section>
			<div className="mb-5">
				<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("hero.title")}</h1>
				<p className="mt-1.5 text-muted-foreground text-sm max-w-lg">{t("hero.subtitle")}</p>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				{TOOL_DEFINITIONS.map((tool) => (
					<div key={tool.href} className="rounded-xl border overflow-hidden">
						<div className="flex items-center gap-3 px-4 py-3 border-b bg-muted">
							<div className="size-8 rounded-md bg-background flex items-center justify-center shrink-0">
								<tool.icon className="size-4 text-muted-foreground" />
							</div>
							<div>
								<span className="text-sm font-medium">
									{t(`tools.${tool.translationKey}.label`)}
								</span>
								<p className="text-xs text-muted-foreground">
									{t(`tools.${tool.translationKey}.description`)}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
							{TARGET_ACCENTS.map((accent) =>
								hasLanguageFeature(accent, tool.requiredFeature) ? (
									<ToolAccentLink
										key={accent}
										href={tool.href}
										accent={accent}
										className="bg-background-soft group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
									>
										{tCommon(`accent.${accent}`)}
										{accent === "es-419" && (
											<Badge variant="info" size="sm">
												{tCommon("accent.beta")}
											</Badge>
										)}
										<ArrowRight className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
									</ToolAccentLink>
								) : (
									<span
										key={accent}
										className="inline-flex flex-col items-center px-3 py-1 text-xs text-muted-foreground"
										aria-disabled="true"
									>
										<span className="flex items-center gap-1.5">
											{tCommon(`accent.${accent}`)}
											{accent === "es-419" && (
												<Badge variant="info" size="sm">
													{tCommon("accent.beta")}
												</Badge>
											)}
										</span>
										<span className="text-[10px]">{t("tools.coming-soon")}</span>
									</span>
								),
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
