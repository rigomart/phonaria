"use client";

import { useState } from "react";
import { consonants } from "shared-data";
import {
	PhonemeDetails,
	PhonemeDetailsExamplesGrid,
	PhonemeDetailsHeader,
	PhonemeDetailsTabs,
} from "@/components/phoneme-details-v2";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function PhonemeDetailsV2TestPage() {
	const [layout, setLayout] = useState<"compact" | "comfortable" | "full">("comfortable");

	const thetaPhoneme = consonants.find((c) => c.symbol === "θ");

	if (!thetaPhoneme) {
		return <div className="p-8">Phoneme /θ/ not found in data</div>;
	}

	const mockPhoneme = {
		...thetaPhoneme,
		pitfalls:
			"Common mistake: Substituting /s/ or /t/ when the tongue is too far back. Keep your tongue tip between your teeth and blow air gently. Another common error is using /f/ - remember the tongue must be visible between the teeth, not the lip against teeth.",
	};

	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-5xl mx-auto space-y-8">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Phoneme Details V2 - Test Page</h1>
					<p className="text-muted-foreground">
						Testing the new tabbed phoneme details component with progressive disclosure patterns.
					</p>
				</div>

				<div className="flex gap-2">
					<Badge
						variant={layout === "compact" ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => setLayout("compact")}
					>
						Compact
					</Badge>
					<Badge
						variant={layout === "comfortable" ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => setLayout("comfortable")}
					>
						Comfortable
					</Badge>
					<Badge
						variant={layout === "full" ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => setLayout("full")}
					>
						Full
					</Badge>
				</div>

				<div className="grid gap-8 md:grid-cols-[1fr,400px]">
					<div className="space-y-4">
						<h2 className="text-xl font-semibold">Component Preview</h2>
						<Card className="p-6">
							<PhonemeDetails phoneme={mockPhoneme} layout={layout}>
								<PhonemeDetailsHeader />
								<PhonemeDetailsTabs />
								<PhonemeDetailsExamplesGrid />
							</PhonemeDetails>
						</Card>
					</div>

					<div className="space-y-4">
						<h2 className="text-xl font-semibold">Implementation Notes</h2>
						<Card className="p-4 text-sm space-y-3">
							<div>
								<h3 className="font-semibold mb-1">Progressive Disclosure</h3>
								<ul className="list-disc list-inside text-muted-foreground space-y-1">
									<li>Tabs instead of collapsibles</li>
									<li>2-column grid for examples</li>
									<li>Show 3-6 examples, expand for more</li>
									<li>Max height with scroll per tab</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold mb-1">Layout Variants</h3>
								<ul className="list-disc list-inside text-muted-foreground space-y-1">
									<li>Compact: 380px, 1-col examples</li>
									<li>Comfortable: 600px, 2-col examples</li>
									<li>Full: 480px, 2-col examples</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold mb-1">Target Height</h3>
								<p className="text-muted-foreground">
									~580px total (vs 900px+ with all-collapsible approach)
								</p>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
