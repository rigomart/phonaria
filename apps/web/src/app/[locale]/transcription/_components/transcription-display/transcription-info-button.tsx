"use client";

import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTargetAccentStore } from "@/store/target-accent-store";

export function TranscriptionInfoButton() {
	const t = useTranslations("g2p-page.transcription-display.info-button");
	const tEnUs = useTranslations("g2p-page.transcription-display.info-button.en-us");
	const tEs419 = useTranslations("g2p-page.transcription-display.info-button.es-419");
	const targetAccent = useTargetAccentStore((s) => s.targetAccent);
	const tLang = targetAccent === "es-419" ? tEs419 : tEnUs;

	const thingsToKnow =
		targetAccent === "es-419"
			? ([
					tEs419("things-to-know.dialect"),
					tEs419("things-to-know.rule-based"),
					tEs419("things-to-know.stress"),
				] as const)
			: ([
					tEnUs("things-to-know.american-accent"),
					tEnUs("things-to-know.coverage"),
					tEnUs("things-to-know.multiple-variants"),
				] as const);

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
						<ul className="list-disc list-inside space-y-1 ml-2">
							{thingsToKnow.map((text) => (
								<li key={text}>{text}</li>
							))}
						</ul>
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
