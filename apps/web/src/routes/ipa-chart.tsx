import { createFileRoute } from "@tanstack/react-router";
import { ConsonantChart } from "@/components/chart/ConsonantChart";
import { VowelChart } from "@/components/chart/VowelChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/ipa-chart")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="mx-auto max-w-5xl px-4 py-6">
			<Tabs defaultValue="consonants">
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
