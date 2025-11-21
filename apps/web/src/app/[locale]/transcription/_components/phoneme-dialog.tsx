"use client";

import { InfoIcon } from "lucide-react";
import { useEffect } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-media-query";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeDialog() {
	const isMobile = useIsMobile();
	const selectedPhonemeId = useG2PStore((state) => state.selectedPhonemeId);
	const hasSelection = useG2PStore((state) => state.hasSelection);
	const phonemeDialogOpen = useG2PStore((state) => state.phonemeDialogOpen);
	const setPhonemeDialogOpen = useG2PStore((state) => state.setPhonemeDialogOpen);

	useEffect(() => {
		if (!isMobile && phonemeDialogOpen) {
			setPhonemeDialogOpen(false);
		}
	}, [isMobile, phonemeDialogOpen, setPhonemeDialogOpen]);

	useEffect(() => {
		if (!hasSelection && phonemeDialogOpen) {
			setPhonemeDialogOpen(false);
		}
	}, [hasSelection, phonemeDialogOpen, setPhonemeDialogOpen]);

	if (!hasSelection) {
		return null;
	}

	const open = isMobile && phonemeDialogOpen;

	// Show empty state when there's a selection but no phonemeId (unmapped CMU token)
	if (!selectedPhonemeId) {
		const emptyState = (
			<Empty className="border-0 bg-linear-120 from-background-strong to-background">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<InfoIcon />
					</EmptyMedia>
					<EmptyDescription>
						This CMU token doesn&apos;t map to a phoneme in our dataset. Try another symbol or
						update the shared data mappings.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);

		return (
			<Dialog open={open} onOpenChange={setPhonemeDialogOpen}>
				<DialogContent className="p-0 gap-0">
					<ScrollArea className="max-h-[min(85vh,calc(100dvh-2rem))]">
						{emptyState}
						<ScrollBar orientation="vertical" />
					</ScrollArea>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<PhonemeDetailsDialog
			open={open}
			onOpenChange={setPhonemeDialogOpen}
			phonemeId={selectedPhonemeId}
		/>
	);
}
