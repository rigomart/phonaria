import { useTranslations } from "next-intl";
import { PhonemeSpellingPatternRegistry } from "@phonaria/phonetics-data";
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

export function PhonemeDetailsPatterns() {
	const { phonemeId } = usePhonemeDetailsContext();
	const t = useTranslations("components.phoneme-details.patterns");

	const spellingData = PhonemeSpellingPatternRegistry[phonemeId];

	if (!spellingData) {
		return null;
	}

	return (
		<PhonemeSection>
			<PhonemeSectionHeader>
				<PhonemeSectionTitle>{t("title")}</PhonemeSectionTitle>
				<PhonemeSectionDescription>{t("description")}</PhonemeSectionDescription>
			</PhonemeSectionHeader>
			<PhonemeSectionContent>
				<div className="rounded-lg space-y-3">
					<div className="flex items-center gap-1.5 flex-wrap">
						<span className="text-xs text-muted-foreground">{t("most-common")}</span>
						{spellingData.patterns.map((pattern) => (
							<Badge key={pattern} variant="accent">
								{pattern}
							</Badge>
						))}
					</div>
					<div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
						{spellingData.examples.map((example) => (
							<Item variant="outline" size="xs" key={example.word}>
								<ItemContent>
									<ItemTitle className="text-sm font-semibold">{example.word}</ItemTitle>
									<ItemDescription className="text-xs text-muted-foreground">
										/{example.phonemic}/
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									<AudioControls
										size="xs"
										variant="compact"
										path={`/audio/${example.word}.mp3`}
										label={example.word}
									/>
								</ItemActions>
							</Item>
						))}
					</div>
				</div>
			</PhonemeSectionContent>
		</PhonemeSection>
	);
}
