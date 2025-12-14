"use client";

import { getIpaForPhonemeId, getPhonemeType } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { Link } from "@/i18n/navigation";
import { AudioControls } from "../audio-controls";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

export function PhonemeDetailsHeader() {
	const { phonemeId } = usePhonemeDetailsContext();
	const t = useTranslations("components.phoneme-details.header.audio-disclaimer");

	const ipa = getIpaForPhonemeId(phonemeId);
	const { phonemeDetailsById } = usePhonemeDetailsCopy();
	const { label } = phonemeDetailsById[phonemeId];

	const phonemeType = getPhonemeType(phonemeId);
	const showAudioControls = phonemeType === "consonant" || phonemeType === "monophthong";

	return (
		<div className="flex flex-col gap-1 bg-background-strong py-2 px-4 shadow-sm">
			<div className="flex gap-4">
				<div className="text-2xl sm:text-4xl flex items-baseline gap-2">
					<span className="text-muted-foreground/50 font-semibold">/</span>
					<span className="leading-none font-bold">{ipa}</span>
					<span className="text-muted-foreground/50 font-semibold">/</span>
				</div>
				{showAudioControls && (
					<div className="flex gap-1">
						<AudioControls
							size="sm"
							path={`/audio/phonemes/${phonemeId}.ogg`}
							label={`Play ${phonemeId}`}
						/>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="icon" aria-label={t("button-label")}>
									<Info className="size-3" />
								</Button>
							</PopoverTrigger>
							<PopoverContent>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">{t("popover-text")}</p>
									<Button
										variant="link"
										size="xs"
										className="h-auto p-0"
										nativeButton={false}
										render={
											<Link href="/credits" target="_blank">
												{t("view-credits")}
											</Link>
										}
									/>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				)}
			</div>
			<p className="text-xs sm:text-sm text-left text-muted-foreground">{label}</p>
		</div>
	);
}
