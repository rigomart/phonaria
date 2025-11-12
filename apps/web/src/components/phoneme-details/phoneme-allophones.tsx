import { phonemeAllophones } from "shared-data";
import { allophoneContextDefinitions } from "@/data/phoneme-details";
import { useScopedI18n } from "@/locales/client";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { usePhonemeDetailsContext } from "./phoneme-details-context";
import {
	PhonemeSection,
	PhonemeSectionContent,
	PhonemeSectionDescription,
	PhonemeSectionHeader,
	PhonemeSectionTitle,
} from "./phoneme-section";

export function PhonemeDetailsAllophones() {
	const { phonemeId } = usePhonemeDetailsContext();
	const t = useScopedI18n("components.phoneme-details.allophones");
	const allophones = phonemeAllophones[phonemeId];

	if (!allophones) return null;

	return (
		<PhonemeSection>
			<PhonemeSectionHeader>
				<PhonemeSectionTitle>{t("title")}</PhonemeSectionTitle>
				<PhonemeSectionDescription>{t("description")}</PhonemeSectionDescription>
			</PhonemeSectionHeader>
			<PhonemeSectionContent>
				{allophones.map((allo) => {
					const contextCopy = allophoneContextDefinitions[allo.contextKey];

					return (
						<div key={allo.ipaVariant} className="space-y-2">
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="text-base font-mono px-2.5 py-0.5">
										{allo.ipaVariant}
									</Badge>
									<span className="text-sm font-semibold">{contextCopy.name}</span>
								</div>
								<p className="text-sm text-muted-foreground pl-1">{contextCopy.description}</p>
								<p className="text-xs text-muted-foreground pl-1 flex items-center gap-1">
									<span className="text-muted-foreground/60">→</span>
									{contextCopy.when}
								</p>
							</div>
							<div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
								{allo.examples.map((ex) => (
									<Item key={ex.word} variant="outline" size="xs">
										<ItemContent>
											<ItemTitle className="text-sm">{ex.word}</ItemTitle>
											<ItemDescription className="text-xs text-muted-foreground">
												/{ex.phonemic}/
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<AudioControls
												size="xs"
												path={`/audio/phoneme-examples/${ex.word}.mp3`}
												label={ex.word}
											/>
										</ItemActions>
									</Item>
								))}
							</div>
						</div>
					);
				})}
			</PhonemeSectionContent>
		</PhonemeSection>
	);
}
