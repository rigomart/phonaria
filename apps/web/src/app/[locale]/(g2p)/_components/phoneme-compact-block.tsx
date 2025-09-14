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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeCompactBlock({
	expanded,
	onToggle,
}: {
	expanded: boolean;
	onToggle: () => void;
}) {
	const { selectedPhoneme } = useG2PStore();

	if (!selectedPhoneme) {
		return (
			<Card className="h-fit">
				<CardHeader className="py-2">
					<div className="text-xs text-muted-foreground">Click a phoneme to see details.</div>
				</CardHeader>
			</Card>
		);
	}

	return (
		<PhonemeDetails phoneme={selectedPhoneme}>
			<Card className="h-fit p-0">
				<CardHeader className="p-0 gap-0">
					<div className="flex items-start justify-between">
						<button
							type="button"
							aria-expanded={expanded}
							aria-controls="phoneme-content"
							onClick={() => onToggle()}
							className="w-full text-left rounded-md cursor-pointer hover:bg-muted/70 active:bg-muted transition flex items-start justify-between p-4"
						>
							<div className="flex-1">
								<PhonemeDetailsHeader />
							</div>
							<div className="flex items-center relative">
								<ChevronDown
									className={`h-5 w-5 absolute right-0 top-0 opacity-70 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
								/>
							</div>
						</button>
					</div>
				</CardHeader>
				{expanded && (
					<CardContent className="p-0">
						<ScrollArea className="h-[400px] pr-3" id="phoneme-content">
							<div className="space-y-6">
								<PhonemeDetailsArticulation />
								<PhonemeDetailsExamples />
								<PhonemeDetailsGuide />
								<PhonemeDetailsAllophones />
							</div>
						</ScrollArea>
					</CardContent>
				)}
			</Card>
		</PhonemeDetails>
	);
}
