"use client";

import { TARGET_LANGUAGES, type TargetLanguage } from "@phonaria/phonetics-data";
import { Badge } from "@phonaria/ui/components/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@phonaria/ui/components/select";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useTargetLanguageStore } from "@/store/target-language-store";

type TargetLanguageSelectorProps = {
	className?: string;
	hideLabel?: boolean;
};

export function TargetLanguageSelector({
	className,
	hideLabel = true,
}: TargetLanguageSelectorProps) {
	const t = useTranslations("common.target-language");
	const targetLanguage = useTargetLanguageStore((s) => s.targetLanguage);
	const setTargetLanguage = useTargetLanguageStore((s) => s.setTargetLanguage);

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<span
				className={cn("text-xs text-muted-foreground whitespace-nowrap", {
					"hidden sm:inline": hideLabel,
				})}
			>
				{t("label")}
			</span>
			<Select
				value={targetLanguage}
				onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}
				itemToStringLabel={(item) => t(item as TargetLanguage)}
			>
				<SelectTrigger className="w-auto min-w-28 bg-background-soft" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{TARGET_LANGUAGES.map((lang) => (
						<SelectItem key={lang} value={lang}>
							<span className="flex items-center gap-1.5">
								{t(lang)}
								{lang === "es" && (
									<Badge variant="info" size="sm">
										{t("beta")}
									</Badge>
								)}
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
