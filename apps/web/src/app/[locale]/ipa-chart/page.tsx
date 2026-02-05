"use client";

import { getLanguagePhonemeCount } from "@phonaria/phonetics-data";
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
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { getIpaChartTargetLanguage } from "./_lib/target-language";
import { ConsonantsSection } from "./_sections/consonants-section";
import { VowelChartSection } from "./_sections/vowels-section";

const IPA_CHART_TABS = ["consonants", "monophthongs", "diphthongs"] as const;
type IpaChartTab = (typeof IPA_CHART_TABS)[number];

export default function IpaChartPage() {
	const tabs = useTranslations("ipa-chart.nav-tabs");
	const hint = useTranslations("ipa-chart.hint");
	const targetLanguage = getIpaChartTargetLanguage();
	const counts = getLanguagePhonemeCount(targetLanguage);

	const COUNT_BY_TAB = {
		consonants: counts.consonants,
		monophthongs: counts.monophthongs,
		diphthongs: counts.diphthongs,
	} as const;

	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsStringEnum<IpaChartTab>([...IPA_CHART_TABS]).withDefault("consonants"),
	);

	const activeCount = COUNT_BY_TAB[activeTab];

	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto min-h-0">
				<div className="min-h-0">
					<Tabs
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as IpaChartTab)}
						className="gap-3 p-2"
					>
						<div className="flex flex-col gap-2">
							<TabsList className="bg-background-strong self-center hidden sm:flex">
								<TabsTrigger className="rounded-xl px-4" value="consonants">
									{tabs("consonants")} ({counts.consonants})
								</TabsTrigger>
								<TabsTrigger className="rounded-xl px-4" value="monophthongs">
									{tabs("monophthongs")} ({counts.monophthongs})
								</TabsTrigger>
								<TabsTrigger className="rounded-xl px-4" value="diphthongs">
									{tabs("diphthongs")} ({counts.diphthongs})
								</TabsTrigger>
							</TabsList>

							<Select
								value={activeTab}
								onValueChange={(value) => setActiveTab(value as IpaChartTab)}
								itemToStringLabel={(item) => tabs(item as IpaChartTab)}
							>
								<SelectTrigger className="w-full sm:w-auto bg-background-soft flex sm:hidden">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="consonants">
										{tabs("consonants")} ({counts.consonants})
									</SelectItem>
									<SelectItem value="monophthongs">
										{tabs("monophthongs")} ({counts.monophthongs})
									</SelectItem>
									<SelectItem value="diphthongs">
										{tabs("diphthongs")} ({counts.diphthongs})
									</SelectItem>
								</SelectContent>
							</Select>

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
				</div>
				<PhonemeDialog />
			</div>
		</div>
	);
}
