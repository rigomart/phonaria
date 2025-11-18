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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
			<DialogContent className="max-w-3xl p-2">
				<ScrollArea className="max-h-[min(95vh,calc(100dvh-2rem))]">
					<DialogHeader>
						<DialogTitle className="sr-only">Phoneme details</DialogTitle>
					</DialogHeader>
					<PhonemeDetails phonemeId={selectedPhonemeId}>
						<PhonemeDetailsHeader />
						<PhonemeDetailsArticulation />
						<PhonemeDetailsPatterns />
						<PhonemeDetailsContrasts />
						<PhonemeDetailsAllophones />
					</PhonemeDetails>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
