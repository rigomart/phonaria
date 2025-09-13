"use client";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsExamples,
	PhonemeDetailsGuide,
	PhonemeDetailsHeader,
	PhonemeDetailsSagittalView,
} from "@/components/phoneme-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIpaChartStore } from "../_store/ipa-chart-store";

export function PhonemeDialog() {
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
						<PhonemeDetails phoneme={selectedPhoneme}>
							<div className="space-y-8">
								<PhonemeDetailsHeader />
								<PhonemeDetailsSagittalView />
								<PhonemeDetailsArticulation />
								<PhonemeDetailsGuide />
								<PhonemeDetailsExamples />
								<PhonemeDetailsAllophones />
							</div>
						</PhonemeDetails>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
