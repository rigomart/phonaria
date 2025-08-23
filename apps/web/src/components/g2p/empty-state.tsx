import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
	onTryExample: (text: string) => void;
	isLoading?: boolean;
}

export function EmptyState({ onTryExample, isLoading }: EmptyStateProps) {
	const examples = [
		{ text: "happy", description: "Basic vowel sounds" },
		{ text: "thought", description: "Silent letters" },
		{ text: "phone", description: "Unusual spelling" },
		{ text: "through", description: "Complex sounds" },
		{ text: "enough", description: "Silent letters" },
		{ text: "night", description: "Diphthongs" },
	];

	return (
		<Card className="bg-muted/20">
			<CardHeader className="text-center pb-3">
				<CardTitle className="text-base flex items-center justify-center gap-2">
					<BookOpen className="w-4 h-4 text-primary" />
					Phonemic Transcription Tool
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Quick How-to */}
				<div className="text-xs text-muted-foreground text-center bg-muted/30 rounded p-2">
					Enter text above → Get IPA transcription → Click phonemes to learn
				</div>

				{/* Examples */}
				<div className="space-y-2">
					<div className="text-sm font-medium">Or try these examples:</div>
					<div className="grid gap-1.5">
						{examples.map(({ text, description }) => (
							<Button
								key={text}
								variant="outline"
								size="sm"
								className="h-auto py-2 px-3 justify-start text-left"
								onClick={() => onTryExample(text)}
								disabled={isLoading}
							>
								<div className="flex items-center justify-between w-full">
									<div className="text-sm">
										<span className="font-medium">"{text}"</span>
										<span className="text-xs text-muted-foreground ml-2">{description}</span>
									</div>
									<ArrowRight className="w-3 h-3 text-muted-foreground" />
								</div>
							</Button>
						))}
					</div>
				</div>

				{/* Quick Tip */}
				<div className="text-xs text-muted-foreground text-center">
					💡 Click any phoneme in your transcription to view articulation details
				</div>
			</CardContent>
		</Card>
	);
}
