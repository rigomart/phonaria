"use client";

import { X } from "lucide-react";

import { PhonemeDetails } from "@/components/phoneme-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
		<div className="flex-1 bg-card relative">
			<Button
				variant="ghost"
				size="sm"
				onClick={closePhonemePanel}
				className="absolute top-2 right-2 h-6 w-6 p-0 z-1"
			>
				<X className="h-3 w-3" />
			</Button>

			<ScrollArea className="max- p-4">
				<PhonemeDetails.Content phoneme={phoneme} />
			</ScrollArea>
		</div>
	);
}
