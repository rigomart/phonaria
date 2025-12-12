"use client";

import { useParams } from "next/navigation";
import { type Locale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
	size = "sm",
	className,
}: {
	size?: "sm" | "default";
	className?: string;
}) {
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
			router.replace({ pathname, params });
		});
	};

	return (
		<Select
			value={locale}
			onValueChange={(value) => handleLocaleChange(value as Locale)}
			disabled={isPending}
		>
			<SelectTrigger
				size={size}
				aria-label={t("label")}
				className={cn("bg-background-soft min-w-24", className)}
			>
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
