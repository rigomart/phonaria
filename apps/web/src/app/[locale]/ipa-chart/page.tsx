"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { ConsonantsSection } from "./_sections/consonants-section";
import { VowelChartSection } from "./_sections/vowels-section";

export default function IpaChartPage() {
	const hero = useScopedI18n("ipa-chart.hero-section");
	const tabs = useScopedI18n("ipa-chart.nav-tabs");

	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto min-h-0">
				<div className="min-h-0 border">
					<div className="border-b p-6">
						<div className="max-w-3xl mx-auto space-y-2">
							<h1 className="text-2xl font-medium text-foreground">{hero("short")}</h1>
							<p className="text-sm text-muted-foreground">{hero("description")}</p>
						</div>
					</div>

					<div className="p-6 space-y-6">
						<Tabs defaultValue="monophthongs" className="space-y-6">
							<TabsList className="flex flex-wrap gap-2 bg-background p-1">
								<TabsTrigger value="monophthongs">{tabs("monophthongs")}</TabsTrigger>
								<TabsTrigger value="diphthongs">{tabs("diphthongs")}</TabsTrigger>
								<TabsTrigger value="consonants">{tabs("consonants")}</TabsTrigger>
							</TabsList>

							<TabsContent value="monophthongs" className="space-y-6">
								<VowelChartSection variant="monophthongs" />
							</TabsContent>
							<TabsContent value="diphthongs" className="space-y-6">
								<VowelChartSection variant="diphthongs" />
							</TabsContent>
							<TabsContent value="consonants" className="space-y-6">
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
