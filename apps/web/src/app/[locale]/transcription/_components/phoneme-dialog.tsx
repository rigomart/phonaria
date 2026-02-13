"use client";

import { Dialog, DialogContent } from "@phonaria/ui/components/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@phonaria/ui/components/empty";
import { ScrollArea, ScrollBar } from "@phonaria/ui/components/scroll-area";
import { InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { PhonemeDetailsDialog } from "@/components/phoneme-details";
import { useIsMobile } from "@/hooks/use-media-query";
import { useTargetAccentStore } from "@/store/target-accent-store";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeDialog() {
	const t = useTranslations("g2p-page.phoneme-inspector");
	const isMobile = useIsMobile();
	const targetAccent = useTargetAccentStore((s) => s.targetAccent);
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
					<EmptyDescription>{t("unmapped.description")}</EmptyDescription>
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
			targetAccent={targetAccent}
		/>
	);
}
