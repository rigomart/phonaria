import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConsonantChart } from "@/components/chart/ConsonantChart";
import { VowelChart } from "@/components/chart/VowelChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/ipa-chart")({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			set: search.set === "vowels" ? "vowels" : "consonants",
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({ from: "/ipa-chart" });
	const { set } = Route.useSearch();

	function updateSet(next: "consonants" | "vowels") {
		if (next === set) return;
		navigate({
			search: (old) => ({ ...old, set: next }),
			replace: false,
		});
	}

	return (
		<main className="mx-auto max-w-5xl px-4 py-6">
			<Tabs
				value={set}
				onValueChange={(v) => updateSet(v as "consonants" | "vowels")}
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
