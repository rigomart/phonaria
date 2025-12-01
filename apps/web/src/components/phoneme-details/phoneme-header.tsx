"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { getIpaForPhonemeId, getPhonemeType } from "shared-data";
import { phonemeDetailsById } from "@/data/phoneme-details";
import { AudioControls } from "../audio-controls";
import { usePhonemeDetailsContext } from "./phoneme-details-context";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useScopedI18n } from "@/locales/client";

export function PhonemeDetailsHeader() {
	const { phonemeId } = usePhonemeDetailsContext();
	const t = useScopedI18n("components.phoneme-details.header.audio-disclaimer");

	const ipa = getIpaForPhonemeId(phonemeId);
	const { label } = phonemeDetailsById[phonemeId];

	const phonemeType = getPhonemeType(phonemeId);
	const showAudioControls =
		phonemeType === "consonant" || phonemeType === "monophthong" || phonemeType === "rhotic";

	return (
		<div className="flex flex-col gap-1 bg-background-strong py-2 px-4 shadow-sm">
			<div className="flex gap-6 items-center">
				<div className="text-2xl sm:text-4xl flex items-baseline gap-2">
					<span className="text-muted-foreground/50 font-semibold">/</span>
					<span className="leading-none font-bold">{ipa}</span>
					<span className="text-muted-foreground/50 font-semibold">/</span>
				</div>
				{showAudioControls && (
					<>
						<AudioControls
							size="sm"
							path={`/audio/phonemes/${phonemeId}.ogg`}
							label={`Play ${phonemeId}`}
						/>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-foreground"
									aria-label={t("button-label")}
								>
									<Info className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-80">
								<div className="space-y-3">
									<p className="text-sm text-muted-foreground">{t("popover-text")}</p>
									<Button asChild variant="link" size="sm" className="h-auto p-0">
										<Link href="/credits">{t("view-credits")}</Link>
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</>
				)}
			</div>
			<p className="text-xs sm:text-sm text-left text-muted-foreground/80">{label}</p>
		</div>
	);
}
