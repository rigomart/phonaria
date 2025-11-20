"use client";

import { InfoIcon } from "lucide-react";
import { useEffect } from "react";
import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "@/components/phoneme-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

	return (
		<Dialog open={open} onOpenChange={setPhonemeDialogOpen}>
			<DialogContent>
				<ScrollArea className="max-h-[min(90vh,calc(100dvh-2rem))]">
					<DialogHeader>
						<DialogTitle className="sr-only">Phoneme details</DialogTitle>
					</DialogHeader>

					{selectedPhonemeId ? (
						<PhonemeDetails phonemeId={selectedPhonemeId}>
							<PhonemeDetailsHeader />
							<PhonemeDetailsArticulation />
							<PhonemeDetailsPatterns />
							<PhonemeDetailsContrasts />
							<PhonemeDetailsAllophones />
						</PhonemeDetails>
					) : (
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
					)}

					<ScrollBar orientation="vertical" />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
