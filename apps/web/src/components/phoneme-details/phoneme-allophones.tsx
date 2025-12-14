import { PhonemeAllophoneRegistry } from "@phonaria/phonetics-data";
import { useTranslations } from "next-intl";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { AudioControls } from "../audio-controls";
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
	const t = useTranslations("components.phoneme-details.allophones");
	const { allophoneContextDefinitions } = usePhonemeDetailsCopy();
	const allophones = PhonemeAllophoneRegistry[phonemeId];

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
						<article key={allo.ipaVariant} className="space-y-3">
							<header className="flex flex-col gap-2">
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground/60">[</span>
									<span className="text-base font-semibold">{allo.ipaVariant}</span>
									<span className="text-muted-foreground/60">]</span>
									<h4 className="text-sm sm:text-base font-semibold">{contextCopy.name}</h4>
								</div>
								<p className="text-xs sm:text-sm text-muted-foreground">
									{contextCopy.description}
								</p>
								<p className="text-xs text-muted-foreground/80 flex items-center gap-1">
									<span>→</span>
									{contextCopy.when}
								</p>
							</header>
							<ul className="grid sm:grid-cols-2 grid-cols-1 gap-2">
								{allo.examples.map((ex) => (
									<Item key={ex.word} variant="outline" size="xs">
										<ItemContent>
											<ItemTitle>{ex.word}</ItemTitle>
											<ItemDescription className="text-xs text-muted-foreground">
												/{ex.phonemic}/
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<AudioControls size="xs" path={`/audio/${ex.word}.mp3`} label={ex.word} />
										</ItemActions>
									</Item>
								))}
							</ul>
						</article>
					);
				})}
			</PhonemeSectionContent>
		</PhonemeSection>
	);
}
