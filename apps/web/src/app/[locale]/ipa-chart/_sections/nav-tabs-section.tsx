"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IpaSection } from "../_store/ipa-chart-store";
import { useIpaChartStore } from "../_store/ipa-chart-store";
import { ConsonantsSection } from "./consonants-section";
import { VowelsSection } from "./vowels-section";

export function NavTabsSection() {
	const activeSection = useIpaChartStore((s) => s.activeSection);
	const setActiveSection = useIpaChartStore((s) => s.setActiveSection);

	return (
		<div className="flex justify-center">
			<Tabs
				value={activeSection}
				onValueChange={(v) => setActiveSection(v as IpaSection)}
				className="w-full max-w-6xl"
			>
				<TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted border">
					<TabsTrigger value="consonants">Consonants</TabsTrigger>
					<TabsTrigger value="vowels">Vowels</TabsTrigger>
				</TabsList>

				<div className="mt-8">
					<TabsContent value="consonants" className="space-y-0">
						<ConsonantsSection />
					</TabsContent>

					<TabsContent value="vowels" className="space-y-0">
						<VowelsSection />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
