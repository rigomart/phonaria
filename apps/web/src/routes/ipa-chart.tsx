import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConsonantChart } from "@/components/chart/ConsonantChart";
import { VowelChart } from "@/components/chart/VowelChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
		<main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
			{/* Segmented navigation replacing tabs; deep-link via ?set= */}
			<div
				role="tablist"
				aria-label="Select phoneme set"
				className="inline-flex rounded-md border bg-muted/30 p-1 text-sm"
			>
				<SegmentedItem
					label="Consonants"
					active={set === "consonants"}
					onClick={() => updateSet("consonants")}
				/>
				<SegmentedItem
					label="Vowels"
					active={set === "vowels"}
					onClick={() => updateSet("vowels")}
				/>
			</div>

			{set === "consonants" ? (
				<section aria-labelledby="consonant-heading">
					<h2 id="consonant-heading" className="sr-only">
						Consonant chart
					</h2>
					<ConsonantChart />
				</section>
			) : null}
			{set === "vowels" ? (
				<section aria-labelledby="vowel-heading">
					<h2 id="vowel-heading" className="sr-only">
						Vowel chart
					</h2>
					<VowelChart />
				</section>
			) : null}
		</main>
	);
}

interface SegmentedItemProps {
	label: string;
	active: boolean;
	onClick: () => void;
}

function SegmentedItem({ label, active, onClick }: SegmentedItemProps) {
	return (
		<Button
			role="tab"
			type="button"
			variant="ghost"
			aria-selected={active}
			aria-controls={undefined}
			className={cn(
				"h-8 rounded-sm px-3 font-medium transition",
				active && "bg-background shadow-sm ring-1 ring-border",
				!active && "opacity-70 hover:opacity-100",
			)}
			onClick={onClick}
		>
			{label}
		</Button>
	);
}
