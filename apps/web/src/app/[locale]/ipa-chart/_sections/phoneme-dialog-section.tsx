"use client";

import { PhonemeDetails } from "@/components/phoneme-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIpaChartStore } from "../_store/ipa-chart-store";

export function PhonemeDialogSection() {
	const dialogOpen = useIpaChartStore((s) => s.dialogOpen);
	const setDialogOpen = useIpaChartStore((s) => s.setDialogOpen);
	const selectedPhoneme = useIpaChartStore((s) => s.selectedPhoneme);

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogContent className="max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto">
				{selectedPhoneme ? (
					<>
						<DialogHeader>
							<DialogTitle className="sr-only">{`Phoneme /${selectedPhoneme.symbol}/`}</DialogTitle>
						</DialogHeader>
						<PhonemeDetails.Root phoneme={selectedPhoneme}>
							<div className="space-y-8">
								<PhonemeDetails.Header />
								<PhonemeDetails.SagittalView />
								<PhonemeDetails.Articulation />
								<PhonemeDetails.Guide />
								<PhonemeDetails.Examples />
								<PhonemeDetails.Allophones />
							</div>
						</PhonemeDetails.Root>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
