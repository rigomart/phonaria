"use client";

import { TARGET_ACCENTS, type TargetAccent } from "@phonaria/phonetics-data";
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
import { useTargetAccentStore } from "@/store/target-accent-store";

type TargetAccentSelectorProps = {
	className?: string;
	hideLabel?: boolean;
	supportedAccents?: readonly TargetAccent[];
};

export function TargetAccentSelector({
	className,
	hideLabel = true,
	supportedAccents = TARGET_ACCENTS,
}: TargetAccentSelectorProps) {
	const t = useTranslations("common.accent");
	const preferredAccent = useTargetAccentStore((s) => s.targetAccent);
	const setTargetAccent = useTargetAccentStore((s) => s.setTargetAccent);

	const effectiveAccent = supportedAccents.includes(preferredAccent)
		? preferredAccent
		: supportedAccents[0];

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
				value={effectiveAccent}
				onValueChange={(v) => setTargetAccent(v as TargetAccent)}
				itemToStringLabel={(item) => t(item as TargetAccent)}
			>
				<SelectTrigger className="w-auto min-w-28 bg-background-soft" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{TARGET_ACCENTS.map((accent) => (
						<SelectItem key={accent} value={accent} disabled={!supportedAccents.includes(accent)}>
							<span className="flex items-center gap-1.5">
								{t(accent)}
								{accent === "es-419" && (
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
