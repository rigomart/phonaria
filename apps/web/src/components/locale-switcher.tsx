"use client";

import { Button } from "@phonaria/ui/components/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@phonaria/ui/components/menu";
import { Globe } from "lucide-react";
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
		<Menu>
			<MenuTrigger
				render={<Button variant="outline" aria-label={t("label")} disabled={isPending} />}
			>
				<Globe className="size-4" />

				<span className="text-sm">{t(locale)}</span>
			</MenuTrigger>
			<MenuPopup>
				{routing.locales.map((l) => (
					<MenuItem key={l} onClick={() => handleLocaleChange(l as Locale)}>
						{t(l)}
					</MenuItem>
				))}
			</MenuPopup>
		</Menu>
	);
}
