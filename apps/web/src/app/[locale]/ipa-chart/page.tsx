"use client";

import { parseAsStringEnum, useQueryState } from "nuqs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { ConsonantsSection } from "./_sections/consonants-section";
import { VowelChartSection } from "./_sections/vowels-section";

const IPA_CHART_TABS = ["monophthongs", "diphthongs", "consonants"] as const;
type IpaChartTab = (typeof IPA_CHART_TABS)[number];

export default function IpaChartPage() {
	const hero = useScopedI18n("ipa-chart.hero-section");
	const tabs = useScopedI18n("ipa-chart.nav-tabs");

	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsStringEnum<IpaChartTab>([...IPA_CHART_TABS]).withDefault("monophthongs"),
	);

	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto min-h-0">
				<div className="min-h-0 border">
					<div className="space-y-2 p-3 sm:p-6 bg-background-soft">
						<h1 className="text-2xl font-medium text-foreground">{hero("short")}</h1>
						<p className="text-sm text-muted-foreground">{hero("description")}</p>
					</div>

					<div className="p-3 sm:p-6">
						<Tabs
							value={activeTab}
							onValueChange={(value) => setActiveTab(value as IpaChartTab)}
							className="gap-5"
						>
							<ScrollArea>
								<TabsList className="">
									<TabsTrigger value="monophthongs">{tabs("monophthongs")}</TabsTrigger>
									<TabsTrigger value="diphthongs">{tabs("diphthongs")}</TabsTrigger>
									<TabsTrigger value="consonants">{tabs("consonants")}</TabsTrigger>
								</TabsList>
								<ScrollBar orientation="horizontal" className="hidden" />
							</ScrollArea>

							<TabsContent value="monophthongs">
								<VowelChartSection variant="monophthongs" />
							</TabsContent>
							<TabsContent value="diphthongs">
								<VowelChartSection variant="diphthongs" />
							</TabsContent>
							<TabsContent value="consonants">
								<ConsonantsSection />
							</TabsContent>
						</Tabs>
					</div>
				</div>
				<PhonemeDialog />
			</div>
		</div>
	);
}
