"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@phonaria/ui/components/select";
import { useParams } from "next/navigation";
import { type Locale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
	const t = useTranslations("components.header.language");
	const pathname = usePathname();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as Locale;
	const [isPending, startTransition] = useTransition();

	const handleLocaleChange = (nextLocale: Locale) => {
		if (nextLocale === locale) return;
		startTransition(() => {
			// @ts-expect-error -- TypeScript will validate that only known `params`
			// are used in combination with a given `pathname`. Since the two will
			// always match for the current route, we can skip runtime checks.
			router.replace({ pathname, params }, { locale: nextLocale });
		});
	};

	return (
		<Select
			value={locale}
			onValueChange={(value) => handleLocaleChange(value as Locale)}
			disabled={isPending}
		>
			<SelectTrigger size="sm" aria-label={t("label")} className="bg-background-soft min-w-24">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{routing.locales.map((l) => (
					<SelectItem key={l} value={l}>
						{t(l)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
