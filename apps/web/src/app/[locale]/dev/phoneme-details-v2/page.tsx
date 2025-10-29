"use client";

import { PhonemeDetails } from "@/components/phoneme-details-v2/phoneme-details";
import { Card } from "@/components/ui/card";

export default function PhonemeDetailsV2TestPage() {
	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-xl mx-auto space-y-8">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Phoneme Details V2 - Simple Static UI</h1>
					<p className="text-muted-foreground">
						Phase 1: Static component with hardcoded /θ/ phoneme data
					</p>
				</div>

				<Card className="p-6">
					<PhonemeDetails />
				</Card>
			</div>
		</div>
	);
}
