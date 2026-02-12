"use client";

import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTargetLanguageStore } from "@/store/target-language-store";

export function TranscriptionInfoButton() {
	const tEn = useTranslations("g2p-page.transcription-display.info-button.en");
	const tEs = useTranslations("g2p-page.transcription-display.info-button.es");
	const t = useTranslations("g2p-page.transcription-display.info-button");
	const targetLanguage = useTargetLanguageStore((s) => s.targetLanguage);
	const tLang = targetLanguage === "es" ? tEs : tEn;

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="size-8 text-muted-foreground hover:text-foreground"
						aria-label={t("aria-label")}
					/>
				}
			>
				<Info className="size-4" />
			</PopoverTrigger>
			<PopoverContent align="end" className="sm:w-96">
				<div className="space-y-2">
					<h4 className="font-semibold text-sm">{t("title")}</h4>
					<div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
						<p>{tLang("description")}</p>
						<p className="font-semibold">{tLang("things-to-know-title")}</p>
						{targetLanguage === "es" ? (
							<ul className="list-disc list-inside space-y-1 ml-2">
								<li>{tEs("things-to-know.dialect")}</li>
								<li>{tEs("things-to-know.rule-based")}</li>
								<li>{tEs("things-to-know.stress")}</li>
							</ul>
						) : (
							<ul className="list-disc list-inside space-y-1 ml-2">
								<li>{tEn("things-to-know.american-accent")}</li>
								<li>{tEn("things-to-know.coverage")}</li>
								<li>{tEn("things-to-know.multiple-variants")}</li>
							</ul>
						)}
						<Link
							href="/credits"
							className="inline-block pt-1 text-xs underline underline-offset-2 hover:text-foreground"
						>
							{t("credits-link")}
						</Link>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
