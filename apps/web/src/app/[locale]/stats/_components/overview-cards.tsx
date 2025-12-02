"use client";

import { cmudictStatsData } from "shared-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { useScopedI18n } from "@/locales/client";

export function OverviewCards() {
	const stats = cmudictStatsData;
	const { overview, meta } = stats;
	const t = useScopedI18n("stats-page.sections.overview");

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl font-semibold">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<ItemGroup className="flex flex-col gap-2">
					<Item variant="outline">
						<ItemContent>
							<ItemDescription>{t("total-words")}</ItemDescription>
							<ItemTitle className="text-2xl">{overview.words.toLocaleString()}</ItemTitle>
						</ItemContent>
					</Item>

					<Item variant="outline">
						<ItemContent>
							<ItemDescription>{t("total-pronunciations")}</ItemDescription>
							<ItemTitle className="text-2xl">{overview.variants.toLocaleString()}</ItemTitle>
						</ItemContent>
					</Item>
				</ItemGroup>
				<div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
					<span>{t("updated-at")}</span>
					<span>{new Date(meta.generatedAt).toLocaleDateString()}</span>
				</div>
			</CardContent>
		</Card>
	);
}
