import { ArrowUpRight, Info } from "lucide-react";
import { allPhonemeSymbols, contrastsByPhonemeId } from "shared-data";
import { useScopedI18n } from "@/locales/client";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

export function PhonemeDetailsContrasts() {
	const { phonemeId } = usePhonemeDetailsContext();

	const t = useScopedI18n(`components.phoneme-details.contrasts`);

	const contrasts = contrastsByPhonemeId.get(phonemeId);

	if (!contrasts || contrasts.length === 0) {
		return null;
	}

	const currentIpa = allPhonemeSymbols[phonemeId].ipa;

	return (
		<section className="space-y-2 px-3 sm:px-4">
			<div className="flex items-center gap-1.5">
				<h3 className="text-base font-bold">{t("title")}</h3>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label={t("learn-more-aria")}
						>
							<Info className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="text-sm">{t("info-text")}</PopoverContent>
				</Popover>
			</div>
			<div className="space-y-3">
				{contrasts.map((contrast) => {
					const partnerIpa = allPhonemeSymbols[contrast.partnerId].ipa;
					// Limit to first pair
					const displayPairs = contrast.minimalPairs[0];

					return (
						<div key={contrast.partnerId} className="space-y-3 px-3 py-2.5 rounded-lg border">
							<div className="flex items-center justify-between gap-3 flex-wrap">
								<div className="flex items-center gap-2 flex-wrap">
									<h4 className="text-sm font-semibold font-mono">
										/{currentIpa}/ vs /{partnerIpa}/
									</h4>
									<div className="flex items-center gap-1.5 flex-wrap">
										{contrast.contrastType.map((type) => (
											<Badge key={type} variant="secondary" className="text-xs capitalize">
												{type}
											</Badge>
										))}
									</div>
								</div>
								<Button variant="ghost" size="xs" disabled>
									{t("open-contrast")}
									<ArrowUpRight className="size-4" />
								</Button>
							</div>

							<div className="space-y-2">
								<div
									key={displayPairs[0].word + displayPairs[1].word}
									className="flex gap-2 rounded-lg"
								>
									<Item size="xs" className="flex-1 bg-background-strong">
										<ItemContent className="flex flex-row items-center gap-1.5">
											<ItemTitle className="text-sm font-semibold">
												{displayPairs[0].word}
											</ItemTitle>
											<span className="text-sm text-muted-foreground font-mono">•</span>
											<ItemDescription className="text-xs text-muted-foreground font-mono">
												/{displayPairs[0].phonemic}/
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<AudioControls
												size="xs"
												path={`/phoneme-examples/${displayPairs[0].word}.mp3`}
												label={displayPairs[0].word}
											/>
										</ItemActions>
									</Item>

									<Item size="xs" className="flex-1 bg-background-strong">
										<ItemContent className="flex flex-row items-center gap-1.5">
											<ItemTitle className="text-sm font-semibold">
												{displayPairs[1].word}
											</ItemTitle>
											<span className="text-sm text-muted-foreground font-mono">•</span>
											<ItemDescription className="text-xs text-muted-foreground font-mono">
												/{displayPairs[1].phonemic}/
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<AudioControls
												size="xs"
												path={`/phoneme-examples/${displayPairs[1].word}.mp3`}
												label={displayPairs[1].word}
											/>
										</ItemActions>
									</Item>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
