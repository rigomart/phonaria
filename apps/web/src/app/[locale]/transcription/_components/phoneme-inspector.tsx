"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@phonaria/ui/components/empty";
import { InfoIcon, MousePointerClickIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	PhonemeDetails,
	PhonemeDetailsAllophones,
	PhonemeDetailsArticulation,
	PhonemeDetailsContent,
	PhonemeDetailsContrasts,
	PhonemeDetailsHeader,
	PhonemeDetailsPatterns,
} from "@/components/phoneme-details";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeInspector() {
	const { selectedPhonemeId, hasSelection } = useG2PStore();
	const t = useTranslations("g2p-page.phoneme-inspector");

	if (!hasSelection) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col">
				<Empty className="h-full border-0 bg-transparent px-6 py-8 text-center">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<MousePointerClickIcon />
						</EmptyMedia>
						<EmptyTitle className="text-base font-semibold text-foreground">
							{t("no-selection.title")}
						</EmptyTitle>
						<EmptyDescription className="text-sm text-muted-foreground">
							{t("no-selection.description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	if (!selectedPhonemeId) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col">
				<Empty className="h-full border-0 bg-transparent px-6 py-8 text-center">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<InfoIcon />
						</EmptyMedia>
						<EmptyDescription className="text-sm text-muted-foreground">
							{t("unmapped.description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<PhonemeDetails phonemeId={selectedPhonemeId}>
			<PhonemeDetailsHeader />
			<PhonemeDetailsContent className="p-3">
				<PhonemeDetailsArticulation />
				<PhonemeDetailsPatterns />
				<PhonemeDetailsContrasts />
				<PhonemeDetailsAllophones />
			</PhonemeDetailsContent>
		</PhonemeDetails>
	);
}
