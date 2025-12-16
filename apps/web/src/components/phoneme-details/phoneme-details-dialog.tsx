"use client";

import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import {
	Dialog,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
} from "@phonaria/ui/components/dialog";
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
				<DialogPopup>
					<DialogHeader className="p-0">
						<PhonemeDetailsHeader />
						<DialogTitle className="sr-only">Phoneme details</DialogTitle>
					</DialogHeader>
					<DialogPanel>
						<PhonemeDetailsContent>
							<PhonemeDetailsArticulation />
							<PhonemeDetailsPatterns />
							<PhonemeDetailsContrasts />
							<PhonemeDetailsAllophones />
						</PhonemeDetailsContent>
					</DialogPanel>
				</DialogPopup>
			</PhonemeDetails>
		</Dialog>
	);
}
