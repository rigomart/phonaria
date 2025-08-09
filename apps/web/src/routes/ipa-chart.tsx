import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConsonantChart } from "@/components/chart/ConsonantChart";
import { VowelChart } from "@/components/chart/VowelChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/ipa-chart")({
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
