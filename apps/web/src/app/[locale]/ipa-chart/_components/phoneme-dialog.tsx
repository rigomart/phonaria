"use client";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "@/components/phoneme-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIpaChartStore } from "../_store/ipa-chart-store";

export function PhonemeDialog() {
	const dialogOpen = useIpaChartStore((s) => s.dialogOpen);
	const setDialogOpen = useIpaChartStore((s) => s.setDialogOpen);
	const selectedPhonemeId = useIpaChartStore((s) => s.selectedPhonemeId);

	if (!selectedPhonemeId) {
		return null;
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogContent className="max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="sr-only">Phoneme details</DialogTitle>
				</DialogHeader>
				<PhonemeDetails phonemeId={selectedPhonemeId} className="p-2">
					<PhonemeDetailsHeader />
					<PhonemeDetailsArticulation />
					<PhonemeDetailsPatterns />
					<PhonemeDetailsContrasts />
					<PhonemeDetailsAllophones />
				</PhonemeDetails>
			</DialogContent>
		</Dialog>
	);
}
