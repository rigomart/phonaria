import { BookOpen, Headphones, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HeroSection() {
	return (
		<section className="border-b border-border/60 bg-background">
			<div className="container mx-auto px-4 py-12 lg:px-6">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Header */}
					<div className="text-center space-y-4">
						<h1 className="text-3xl font-semibold tracking-tight">Pronunciation learning tools</h1>
						<p className="text-base text-muted-foreground max-w-2xl mx-auto">
							Choose a tool to start practicing. Each tool focuses on a different aspect of
							pronunciation learning, from understanding individual sounds to listening practice.
						</p>
					</div>

					{/* Quick start tools */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card className="border-border/60 hover:border-primary/40 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-primary" />
									<CardTitle className="text-lg">G2P Studio</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-muted-foreground">
									Type any text to see its phonetic transcription and learn individual sounds.
								</p>
								<Button asChild className="w-full" variant="outline">
									<Link href="/">Open G2P Studio</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="border-border/60 hover:border-primary/40 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<BookOpen className="h-5 w-5 text-primary" />
									<CardTitle className="text-lg">IPA Chart</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-muted-foreground">
									Browse all English phonemes with audio examples and articulation details.
								</p>
								<Button asChild className="w-full" variant="outline">
									<Link href="/ipa-chart">View Chart</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="border-border/60 hover:border-primary/40 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Headphones className="h-5 w-5 text-primary" />
									<CardTitle className="text-lg">Sound Contrasts</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-muted-foreground">
									Contrast nearby phonemes with guided listening and articulation prompts.
								</p>
								<Button asChild className="w-full" variant="outline">
									<Link href="/contrasts">Explore Contrasts</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Learning guidance */}
					<div className="bg-muted/30 rounded-lg p-6 border border-border/40">
						<h2 className="font-medium mb-3">How to use these tools</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
							<div>
								<p className="font-medium text-foreground mb-1">Start with IPA Chart</p>
								<p>Learn individual sounds and how they're produced</p>
							</div>
							<div>
								<p className="font-medium text-foreground mb-1">Use G2P Studio</p>
								<p>Transcribe words you encounter in your reading</p>
							</div>
							<div>
								<p className="font-medium text-foreground mb-1">Practice with Contrasts</p>
								<p>Improve your listening and pronunciation accuracy</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
