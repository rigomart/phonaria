"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useScopedI18n } from "@/locales/client";

export function TranscriptionInfoButton() {
	const t = useScopedI18n("g2p-page.transcription-display.info-button");

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-foreground"
					aria-label={t("aria-label")}
				>
					<Info className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 max-w-md">
				<div className="space-y-3">
					<h4 className="font-medium text-sm">{t("title")}</h4>
					<div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
						<p>{t("description")}</p>
						<p>
							<strong className="text-foreground">{t("limitations-title")}</strong>
						</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>{t("limitations.newer-words")}</li>
							<li>{t("limitations.proper-nouns")}</li>
							<li>{t("limitations.homographs")}</li>
						</ul>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
