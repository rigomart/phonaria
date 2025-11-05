"use client";

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

	return <>Phoneme Detals</>;
}
