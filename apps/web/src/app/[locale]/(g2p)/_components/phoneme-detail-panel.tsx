"use client";

import { X } from "lucide-react";

import { PhonemeDetails } from "@/components/phoneme-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
		<Card className="h-fit sticky top-6">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-end">
					<Button variant="ghost" size="sm" onClick={closePhonemePanel} className="h-6 w-6 p-0">
						<X className="h-3 w-3" />
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<ScrollArea className="h-[400px] pr-3">
					<PhonemeDetails.Content phoneme={phoneme} />
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
