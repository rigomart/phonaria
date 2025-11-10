import { phonemeSpellingPatterns } from "shared-data";
import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { usePhonemeDetailsContext } from "./phoneme-details-context";

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

export function PhonemeDetailsPatterns() {
	const { phonemeId } = usePhonemeDetailsContext();

	const spellingData = phonemeSpellingPatterns[phonemeId];

	if (!spellingData) {
		return null;
	}

	return (
		<section className="space-y-2 px-3 sm:px-4">
			<h3 className="text-base font-bold">Common Spelling Patterns</h3>
			<div className="rounded-lg space-y-3">
				<div className="flex items-center gap-1.5 flex-wrap">
					{spellingData.patterns.map((pattern) => (
						<Badge key={pattern} variant="secondary" className="font-mono">
							{pattern}
						</Badge>
					))}
				</div>
				<div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
					{spellingData.examples.map((example) => (
						<Item variant="outline" size="xs" key={example.word}>
							<ItemContent>
								<ItemTitle className="text-sm font-semibold">{example.word}</ItemTitle>
								<ItemDescription className="text-xs text-muted-foreground font-mono">
									/{example.phonemic}/
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<AudioControls
									size="xs"
									path={`${BUCKET_URL}/phoneme-examples/${example.word}.mp3`}
									label={example.word}
								/>
							</ItemActions>
						</Item>
					))}
				</div>
			</div>
		</section>
	);
}
