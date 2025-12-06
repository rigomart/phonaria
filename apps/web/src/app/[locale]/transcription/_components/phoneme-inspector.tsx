"use client";

import { InfoIcon, MousePointerClickIcon } from "lucide-react";
import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContent,
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
			<Empty className="h-full border-0 bg-transparent px-6 py-8 text-center">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="rounded-full border border-border/70 bg-background shadow-sm"
					>
						<MousePointerClickIcon />
					</EmptyMedia>
					<EmptyTitle className="text-base font-semibold text-foreground">
						Select a phoneme
					</EmptyTitle>
					<EmptyDescription className="text-sm text-muted-foreground">
						Click any symbol like /ə/ to view articulation, contrasts, and spelling patterns.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (!selectedPhonemeId) {
		return (
			<Empty className="h-full border-0 bg-transparent px-6 py-8 text-center">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="rounded-full border border-border/70 bg-background shadow-sm"
					>
						<InfoIcon />
					</EmptyMedia>
					<EmptyDescription className="text-sm text-muted-foreground">
						This CMU token doesn&apos;t map to a phoneme in our dataset. Try another symbol or
						update the shared data mappings.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="rounded-xl border border-border/80 bg-background shadow-sm">
			<PhonemeDetails phonemeId={selectedPhonemeId}>
				<PhonemeDetailsHeader />
				<PhonemeDetailsContent>
					<PhonemeDetailsArticulation />
					<PhonemeDetailsPatterns />
					<PhonemeDetailsContrasts />
					<PhonemeDetailsAllophones />
				</PhonemeDetailsContent>
			</PhonemeDetails>
		</div>
	);
}
