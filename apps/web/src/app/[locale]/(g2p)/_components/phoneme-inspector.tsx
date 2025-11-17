"use client";

import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "@/components/phoneme-details";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeInspector() {
	const { selectedPhonemeId, hasSelection } = useG2PStore();

	if (!hasSelection) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center space-y-2 px-6">
					<div className="text-base text-muted-foreground">
						Select a phoneme from the transcription.
					</div>
					<div className="text-sm text-muted-foreground">
						Click any symbol like /aɪ/ to explore details.
					</div>
				</div>
			</div>
		);
	}

	if (!selectedPhonemeId) {
		return (
			<div className="h-full flex items-center justify-center px-6 text-center space-y-3">
				<p className="text-sm text-muted-foreground">
					This CMU token doesn’t map to a phoneme in our dataset. Try another symbol or update the
					shared data mappings.
				</p>
			</div>
		);
	}

	return (
		<PhonemeDetails phonemeId={selectedPhonemeId} className="p-2">
			<PhonemeDetailsHeader />
			<PhonemeDetailsArticulation />
			<PhonemeDetailsPatterns />
			<PhonemeDetailsContrasts />
			<PhonemeDetailsAllophones />
		</PhonemeDetails>
	);
}
