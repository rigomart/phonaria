"use client";

import { PhonemeDetailsDialog } from "@/components/phoneme-details";
import { useIpaChartStore } from "../_store/ipa-chart-store";

export function PhonemeDialog() {
	const dialogOpen = useIpaChartStore((s) => s.dialogOpen);
	const setDialogOpen = useIpaChartStore((s) => s.setDialogOpen);
	const selectedPhonemeId = useIpaChartStore((s) => s.selectedPhonemeId);

	if (!selectedPhonemeId) {
		return null;
	}

	return (
		<PhonemeDetailsDialog
			open={dialogOpen}
			onOpenChange={setDialogOpen}
			phonemeId={selectedPhonemeId}
		/>
	);
}
