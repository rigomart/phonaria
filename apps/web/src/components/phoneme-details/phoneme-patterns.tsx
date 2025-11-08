import { AudioControls } from "../audio-controls";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";

export function PhonemeDetailsPatterns() {
	const examples = {
		patterns: ["th-", "ph"],
		words: [
			{
				grapheme: { chars: ["t", "h", "i", "n", "k"], highlight: [0, 1] },
				phonemic: { chars: ["θ", "ɪ", "ŋ", "k"], highlight: [0] },
				audioUrl: "https://assets.rigos.dev/phoneme-examples/think.mp3",
			},
			{
				grapheme: { chars: ["m", "o", "n", "t", "h"], highlight: [3, 4] },
				phonemic: { chars: ["m", "ʌ", "n", "θ"], highlight: [3] },
				audioUrl: "https://assets.rigos.dev/phoneme-examples/month.mp3",
			},
		],
	};
	return (
		<section className="px-3 sm:px-4">
			<div className="rounded-lg space-y-2">
				<div className="flex items-center gap-1.5 flex-wrap">
					<span className="text-xs text-muted-foreground">Common spelling patterns:</span>
					{examples.patterns.map((pattern) => (
						<Badge key={pattern} variant="secondary">
							{pattern}
						</Badge>
					))}
				</div>
				<div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
					{examples.words.map((example) => (
						<Item variant="outline" size="xs" key={example.grapheme.chars.join("")}>
							<ItemContent>
								<ItemTitle className="text-sm flex items-center gap-0">
									{example.grapheme.chars.map((char, index) => (
										<span
											key={char}
											className={example.grapheme.highlight.includes(index) ? "text-primary" : ""}
										>
											{char}
										</span>
									))}
								</ItemTitle>
								<ItemDescription className="text-xs text-muted-foreground">
									/
									{example.phonemic.chars.map((char, index) => (
										<span
											key={char}
											className={example.phonemic.highlight.includes(index) ? "text-primary" : ""}
										>
											{char}
										</span>
									))}
									/
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<AudioControls
									size="xs"
									path={example.audioUrl}
									label={example.grapheme.chars.join("")}
								/>
							</ItemActions>
						</Item>
					))}
				</div>
			</div>
		</section>
	);
}
