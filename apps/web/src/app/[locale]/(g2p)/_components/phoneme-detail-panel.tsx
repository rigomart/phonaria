"use client";

import { ChevronDown } from "lucide-react";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsExamples,
	PhonemeDetailsGuide,
	PhonemeDetailsHeader,
} from "@/components/phoneme-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeDetailPanel() {
	const { selectedPhoneme, closePhonemePanel } = useG2PStore();
	const phoneme = selectedPhoneme;

	if (!phoneme) {
		return (
			<Card className="h-fit">
				<CardContent className="p-6 text-center">
					<div className="text-sm text-muted-foreground">Click a phoneme to view details</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="flex-1">
			<CardHeader className="py-2">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-xs">Phoneme</CardTitle>
					<button
						type="button"
						className="rounded-md p-1 -m-1 hover:bg-muted/70 active:bg-muted transition flex items-center gap-1"
						onClick={closePhonemePanel}
						aria-label="Collapse phoneme details"
					>
						<ChevronDown className="h-3 w-3 rotate-180" />
					</button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="max-h-[60vh] p-4">
					<PhonemeDetails phoneme={phoneme}>
						<div className="space-y-8">
							<PhonemeDetailsHeader />
							<PhonemeDetailsArticulation />
							<PhonemeDetailsGuide />
							<PhonemeDetailsExamples />
							<PhonemeDetailsAllophones />
						</div>
					</PhonemeDetails>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
