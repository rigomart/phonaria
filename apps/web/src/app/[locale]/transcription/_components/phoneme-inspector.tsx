"use client";

import { InfoIcon, MousePointerClickIcon } from "lucide-react";
import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "@/components/phoneme-details";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeInspector() {
	const { selectedPhonemeId, hasSelection } = useG2PStore();

	if (!hasSelection) {
		return (
			<Empty className="h-full border-0 bg-linear-120 from-background-strong to-background">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<MousePointerClickIcon />
					</EmptyMedia>
					<EmptyTitle>Select a phoneme from the transcription</EmptyTitle>
					<EmptyDescription>Click any symbol like /ə/ to explore details.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (!selectedPhonemeId) {
		return (
			<Empty className="h-full border-0 bg-linear-120 from-background-strong to-background">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<InfoIcon />
					</EmptyMedia>
					<EmptyDescription>
						This CMU token doesn't map to a phoneme in our dataset. Try another symbol or update the
						shared data mappings.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
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
