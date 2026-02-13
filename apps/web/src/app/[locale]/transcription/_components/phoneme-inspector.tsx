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
import { useTargetLanguageStore } from "@/store/target-language-store";
import { useG2PStore } from "../_store/g2p-store";

export function PhonemeInspector() {
	const { selectedPhonemeId, hasSelection } = useG2PStore();
	const targetLanguage = useTargetLanguageStore((s) => s.targetLanguage);
	const t = useTranslations("g2p-page.phoneme-inspector");

	if (!hasSelection) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col">
				<Empty className="h-full border-0 bg-transparent px-4 py-6 text-center">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<MousePointerClickIcon />
						</EmptyMedia>
						<EmptyTitle className="text-sm font-semibold text-foreground">
							{t("no-selection.title")}
						</EmptyTitle>
						<EmptyDescription className="text-sm text-muted-foreground leading-relaxed">
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
				<Empty className="h-full border-0 bg-transparent px-4 py-6 text-center">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<InfoIcon />
						</EmptyMedia>
						<EmptyDescription className="text-sm text-muted-foreground leading-relaxed">
							{t("unmapped.description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<PhonemeDetails phonemeId={selectedPhonemeId} targetLanguage={targetLanguage}>
			<div className="flex h-full flex-col min-h-0">
				<div className="shrink-0">
					<PhonemeDetailsHeader />
				</div>
				<PhonemeDetailsContent className="p-4 flex-1 min-h-0">
					<PhonemeDetailsArticulation />
					<PhonemeDetailsPatterns />
					<PhonemeDetailsContrasts />
					<PhonemeDetailsAllophones />
				</PhonemeDetailsContent>
			</div>
		</PhonemeDetails>
	);
}
