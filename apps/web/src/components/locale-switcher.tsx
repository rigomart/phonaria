"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const LOCALES = routing.locales as readonly ["en", "es"];
type Locale = (typeof LOCALES)[number];

export function LocaleSwitcher({
	size = "sm",
	className,
}: {
	size?: "sm" | "default";
	className?: string;
}) {
	const t = useTranslations("components.header.language");
	const locale = useLocale() as Locale;
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const handleLocaleChange = (nextLocale: Locale) => {
		if (nextLocale === locale) return;
		const query = searchParams.toString();
		const href = query ? `${pathname}?${query}` : pathname;
		startTransition(() => {
			router.replace(href, { locale: nextLocale });
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
				{LOCALES.map((l) => (
					<SelectItem key={l} value={l}>
						{t(l)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
