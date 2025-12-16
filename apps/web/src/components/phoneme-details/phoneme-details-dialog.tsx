"use client";

import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@phonaria/ui/components/dialog";
import { ScrollArea, ScrollBar } from "@phonaria/ui/components/scroll-area";
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

export function PhonemeDetailsDialog({ open, onOpenChange, phonemeId }: PhonemeDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<PhonemeDetails phonemeId={phonemeId}>
				<DialogContent>
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
