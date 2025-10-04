"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IpaSection } from "../_store/ipa-chart-store";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import { ConsonantsSection } from "./consonants-section";
import { VowelsSection } from "./vowels-section";

export function NavTabsSection() {
	const t = useTranslations("IpaChart.NavTabs");
	const activeSection = useIpaChartStore((s) => s.activeSection);
	const setActiveSection = useIpaChartStore((s) => s.setActiveSection);

	return (
		<div className="p-6">
			<Tabs
				value={activeSection}
				onValueChange={(v) => setActiveSection(v as IpaSection)}
				className="w-full max-w-6xl mx-auto"
			>
				<TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted border">
					<TabsTrigger value="consonants">{t("consonants")}</TabsTrigger>
					<TabsTrigger value="vowels">{t("vowels")}</TabsTrigger>
				</TabsList>

				<div className="mt-8">
					<TabsContent value="consonants" className="space-y-6">
						<ConsonantsSection />
					</TabsContent>

					<TabsContent value="vowels" className="space-y-6">
						<VowelsSection />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
