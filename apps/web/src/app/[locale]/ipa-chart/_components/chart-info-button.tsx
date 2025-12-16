"use client";

import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

type ChartInfoButtonProps = {
	content: string;
	ariaLabel: string;
};

export function ChartInfoButton({ content, ariaLabel }: ChartInfoButtonProps) {
	const t = useTranslations("ipa-chart.info-button");

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						className="h-auto px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground gap-1 sm:gap-1.5"
						aria-label={ariaLabel}
					/>
				}
			>
				<Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
				<span className="hidden sm:inline">{t("label")}</span>
				<span className="sm:hidden">{t("label-short")}</span>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
				<p className="text-xs sm:text-sm text-foreground leading-relaxed">{content}</p>
			</PopoverContent>
		</Popover>
	);
}
