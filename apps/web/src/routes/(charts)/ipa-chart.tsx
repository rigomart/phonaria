import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsonantChart } from "@/routes/(charts)/-components/chart/consonant-chart";
import { VowelChart } from "@/routes/(charts)/-components/chart/vowel-chart";

export const Route = createFileRoute("/(charts)/ipa-chart")({
	component: RouteComponent,
});

function RouteComponent() {
	const [activeSection, setActiveSection] = useState<"consonants" | "vowels">("consonants");

	return (
		<main className="mx-auto max-w-6xl py-6">
			<Tabs
				value={activeSection}
				onValueChange={(v) => setActiveSection(v as "consonants" | "vowels")}
				className="space-y-6"
			>
				<TabsList>
					<TabsTrigger value="consonants">Consonants</TabsTrigger>
					<TabsTrigger value="vowels">Vowels</TabsTrigger>
				</TabsList>
				<TabsContent value="consonants">
					<ConsonantChart />
				</TabsContent>
				<TabsContent value="vowels">
					<VowelChart />
				</TabsContent>
			</Tabs>
		</main>
	);
}
