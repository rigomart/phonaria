"use client";

import { getLanguagePhonemeCount, isPhonemeInLanguage } from "@phonaria/phonetics-data";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@phonaria/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@phonaria/ui/components/tabs";
import { useTranslations } from "next-intl";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { TargetLanguageSelector } from "@/components/target-language-selector";
import { useTargetLanguageStore } from "@/store/target-language-store";
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { ConsonantsSection } from "./_sections/consonants-section";
import { VowelChartSection } from "./_sections/vowels-section";
import { useIpaChartStore } from "./_store/ipa-chart-store";

const IPA_CHART_TABS = ["consonants", "monophthongs", "diphthongs"] as const;
type IpaChartTabValue = (typeof IPA_CHART_TABS)[number];

export default function IpaChartPage() {
	const tabs = useTranslations("ipa-chart.nav-tabs");
	const hint = useTranslations("ipa-chart.hint");

	const targetLanguage = useTargetLanguageStore((s) => s.targetLanguage);

	const counts = getLanguagePhonemeCount(targetLanguage);

	const COUNT_BY_TAB = {
		consonants: counts.consonants,
		monophthongs: counts.monophthongs,
		diphthongs: counts.diphthongs,
	} as const;

	const availableTabs = useMemo(
		() =>
			IPA_CHART_TABS.filter((tab) => {
				const tabCounts = getLanguagePhonemeCount(targetLanguage);
				return tabCounts[tab] > 0;
			}),
		[targetLanguage],
	);

	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsStringEnum<IpaChartTabValue>([...IPA_CHART_TABS]).withDefault("consonants"),
	);

	// Reset tab if current tab is not available for this target language
	useEffect(() => {
		if (!availableTabs.includes(activeTab)) {
			setActiveTab("consonants");
		}
	}, [availableTabs, activeTab, setActiveTab]);

	// Clear phoneme selection if the selected phoneme is not in the new target language
	const selectedPhonemeId = useIpaChartStore((s) => s.selectedPhonemeId);
	const clearSelection = useIpaChartStore((s) => s.clearSelection);

	useEffect(() => {
		if (selectedPhonemeId && !isPhonemeInLanguage(targetLanguage, selectedPhonemeId)) {
			clearSelection();
		}
	}, [targetLanguage, selectedPhonemeId, clearSelection]);

	const activeCount = COUNT_BY_TAB[activeTab];

	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto min-h-0">
				<Tabs
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as IpaChartTabValue)}
					className="gap-3 p-2"
				>
					<div className="flex flex-col gap-2">
						{/* Desktop: tabs left, language selector far right */}
						<div className="hidden sm:flex items-center justify-between">
							<TabsList className="bg-background-strong">
								{availableTabs.map((tab) => (
									<TabsTrigger key={tab} className="rounded-xl px-4" value={tab}>
										{tabs(tab)} ({COUNT_BY_TAB[tab]})
									</TabsTrigger>
								))}
							</TabsList>
							<TargetLanguageSelector />
						</div>

						{/* Mobile: both selects side by side */}
						<div className="flex sm:hidden items-center gap-2">
							<Select
								value={activeTab}
								onValueChange={(value) => setActiveTab(value as IpaChartTabValue)}
								itemToStringLabel={(item) => tabs(item as IpaChartTabValue)}
							>
								<SelectTrigger className="flex-1 bg-background-soft">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{availableTabs.map((tab) => (
										<SelectItem key={tab} value={tab}>
											{tabs(tab)} ({COUNT_BY_TAB[tab]})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<TargetLanguageSelector className="shrink-0" />
						</div>

						<p className="text-xs text-muted-foreground text-center">
							{activeCount} {hint("sounds")} · {hint("click-for-details")}
						</p>
					</div>

					<TabsContent value="consonants">
						<ConsonantsSection targetLanguage={targetLanguage} />
					</TabsContent>
					<TabsContent value="monophthongs">
						<VowelChartSection variant="monophthongs" targetLanguage={targetLanguage} />
					</TabsContent>
					<TabsContent value="diphthongs">
						<VowelChartSection variant="diphthongs" targetLanguage={targetLanguage} />
					</TabsContent>
				</Tabs>

				<PhonemeDialog targetLanguage={targetLanguage} />
			</div>
		</div>
	);
}
