"use client";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "@/components/phoneme-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeInspector() {
	const { selectedPhoneme } = useG2PStore();

	if (!selectedPhoneme) {
		return (
			<Card className="h-full rounded-none">
				<CardHeader className="py-3">
					<div className="text-xs font-medium">Phoneme</div>
				</CardHeader>
				<CardContent className="h-[calc(100%-44px)] p-0">
					<div className="h-full flex items-center justify-center">
						<div className="text-center space-y-2 px-6">
							<div className="text-sm text-muted-foreground">
								Select a phoneme from the transcription.
							</div>
							<div className="text-xs text-muted-foreground">
								Click any symbol like /aɪ/ to explore details.
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!selectedPhoneme.isKnown || !selectedPhoneme.phonemeId) {
		return (
			<Card className="h-full rounded-none">
				<CardHeader className="py-3">
					<div className="text-xs font-medium">Phoneme</div>
				</CardHeader>
				<CardContent className="h-[calc(100%-44px)] p-0">
					<div className="h-full flex items-center justify-center px-6 text-center space-y-3">
						<div className="flex items-center justify-center gap-2 text-lg font-semibold">
							<Badge variant="outline" className="font-mono text-base">
								{selectedPhoneme.symbol}
							</Badge>
							<span className="text-muted-foreground">Not in database yet</span>
						</div>
						<p className="text-sm text-muted-foreground">
							This CMU token doesn’t map to a phoneme in our dataset. Try another symbol or update
							the shared data mappings.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<PhonemeDetails phonemeId={selectedPhoneme.phonemeId} className="p-2">
			<PhonemeDetailsHeader />
			<PhonemeDetailsArticulation />
			<PhonemeDetailsPatterns />
			<PhonemeDetailsContrasts />
			<PhonemeDetailsAllophones />
		</PhonemeDetails>
	);
}
