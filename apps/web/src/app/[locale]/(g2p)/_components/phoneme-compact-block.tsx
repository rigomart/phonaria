"use client";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsExamples,
	PhonemeDetailsGuide,
	PhonemeDetailsHeader,
} from "@/components/phoneme-details";
import { Card, CardHeader } from "@/components/ui/card";
import { useG2PStore } from "../_store/g2p-store";
import {
	CollapsibleDetailCard,
	CollapsibleDetailCardContent,
	CollapsibleDetailCardHeader,
} from "./collapsible-detail-card";

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
			<CollapsibleDetailCard expanded={expanded} onToggle={onToggle}>
				<CollapsibleDetailCardHeader controlsId="phoneme-content">
					<PhonemeDetailsHeader />
				</CollapsibleDetailCardHeader>
				<CollapsibleDetailCardContent id="phoneme-content">
					<div className="max-h-80 overflow-auto pb-6">
						<div className="space-y-6">
							<PhonemeDetailsArticulation />
							<PhonemeDetailsExamples />
							<PhonemeDetailsGuide />
							<PhonemeDetailsAllophones />
						</div>
					</div>
				</CollapsibleDetailCardContent>
			</CollapsibleDetailCard>
		</PhonemeDetails>
	);
}
