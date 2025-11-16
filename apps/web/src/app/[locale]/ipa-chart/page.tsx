"use client";

import { PhonemeDialog } from "./_components/phoneme-dialog";
import { ConsonantsSection } from "./_sections/consonants-section";

export default function IpaChartPage() {
	return (
		<div className="flex-1 min-h-0 bg-background">
			<div className="container mx-auto min-h-0">
				<div className="min-h-0 border">
					<div className="border-b p-6">
						<div className="max-w-3xl mx-auto space-y-2">
							<h1 className="text-2xl font-medium text-foreground">Interactive IPA Chart</h1>
							<p className="text-sm text-muted-foreground">
								Consonants organized by manner and place of articulation
							</p>
						</div>
					</div>

					<div className="p-6">
						<ConsonantsSection />
					</div>
				</div>
				<PhonemeDialog />
			</div>
		</div>
	);
}
