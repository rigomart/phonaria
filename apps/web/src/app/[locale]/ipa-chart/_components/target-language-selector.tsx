"use client";

import { TARGET_LANGUAGES, type TargetLanguage } from "@phonaria/phonetics-data";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@phonaria/ui/components/select";
import { useTranslations } from "next-intl";

type TargetLanguageSelectorProps = {
	value: TargetLanguage;
	onValueChange: (value: TargetLanguage) => void;
};

export function TargetLanguageSelector({ value, onValueChange }: TargetLanguageSelectorProps) {
	const t = useTranslations("ipa-chart.target-language");

	return (
		<div className="flex items-center gap-2">
			<span className="text-xs text-muted-foreground whitespace-nowrap">{t("label")}</span>
			<Select
				value={value}
				onValueChange={(v) => onValueChange(v as TargetLanguage)}
				itemToStringLabel={(item) => t(item as TargetLanguage)}
			>
				<SelectTrigger className="w-auto min-w-28 bg-background-soft" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{TARGET_LANGUAGES.map((lang) => (
						<SelectItem key={lang} value={lang}>
							{t(lang)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
