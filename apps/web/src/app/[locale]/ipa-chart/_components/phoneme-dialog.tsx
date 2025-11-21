"use client";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContent,
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
			<PhonemeDetails phonemeId={selectedPhonemeId}>
				<DialogContent className="max-w-3xl p-0 gap-0">
					<DialogHeader>
						<PhonemeDetailsHeader />
						<DialogTitle className="sr-only">Phoneme details</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[min(85vh,calc(100dvh-2rem))]">
						<PhonemeDetailsContent>
							<PhonemeDetailsArticulation />
							<PhonemeDetailsPatterns />
							<PhonemeDetailsContrasts />
							<PhonemeDetailsAllophones />
						</PhonemeDetailsContent>
						<ScrollBar orientation="vertical" />
					</ScrollArea>
				</DialogContent>
			</PhonemeDetails>
		</Dialog>
	);
}
