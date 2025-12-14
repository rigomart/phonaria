"use client";

import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContent,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "./index";

type PhonemeDetailsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	phonemeId: PhonemeSymbolId;
	maxWidth?: string;
};

export function PhonemeDetailsDialog({
	open,
	onOpenChange,
	phonemeId,
	maxWidth = "max-w-3xl",
}: PhonemeDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<PhonemeDetails phonemeId={phonemeId}>
				<DialogContent className={`${maxWidth} p-0 gap-0 overflow-hidden`}>
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
