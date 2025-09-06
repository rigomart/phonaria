import { Eye, MousePointer, Sparkles, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
			{/* Hero Visual */}
			<div className="relative">
				<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
					<div className="text-2xl font-bold text-primary font-mono">/aɪ/</div>
				</div>
				<Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
			</div>

			{/* Main Message */}
			<div className="space-y-3 max-w-md">
				<h2 className="text-xl font-semibold text-foreground">Discover How Words Really Sound</h2>
				<p className="text-sm text-muted-foreground leading-relaxed">
					Enter any English word or sentence above to see its phonemic transcription using the
					International Phonetic Alphabet (IPA). Learn the exact sounds that make up English
					pronunciation.
				</p>
			</div>

			{/* Features Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
				<Card className="bg-muted/30 border-0">
					<CardContent className="p-4 text-center space-y-2">
						<Volume2 className="w-5 h-5 text-primary mx-auto" />
						<div className="text-xs font-medium">Audio Examples</div>
						<div className="text-xs text-muted-foreground">Hear native pronunciations</div>
					</CardContent>
				</Card>

				<Card className="bg-muted/30 border-0">
					<CardContent className="p-4 text-center space-y-2">
						<Eye className="w-5 h-5 text-primary mx-auto" />
						<div className="text-xs font-medium">Visual Guides</div>
						<div className="text-xs text-muted-foreground">See mouth positions</div>
					</CardContent>
				</Card>

				<Card className="bg-muted/30 border-0">
					<CardContent className="p-4 text-center space-y-2">
						<MousePointer className="w-5 h-5 text-primary mx-auto" />
						<div className="text-xs font-medium">Interactive</div>
						<div className="text-xs text-muted-foreground">Click any phoneme</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
