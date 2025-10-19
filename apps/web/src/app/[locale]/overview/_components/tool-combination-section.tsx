import { Route, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ToolCombinationSection() {
	return (
		<section className="border-b border-border/60 bg-muted/40">
			<div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-12 lg:px-6">
				<div className="space-y-5">
					<h2 className="text-2xl font-semibold tracking-tight">Ways to combine the tools</h2>
					<p className="text-base text-muted-foreground">
						The examples below show how you might pair the current modules. Use them as starting
						points and adapt them to your own routine.
					</p>
					<div className="grid gap-3">
						<div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
							<Sparkles className="mt-1 size-5 text-primary" aria-hidden="true" />
							<div>
								<p className="font-semibold">Plan a weekly focus</p>
								<p className="text-sm text-muted-foreground">
									Start by reviewing target sounds in the IPA chart. When you meet them in your own
									reading, send the sentence to the transcription studio for a closer look.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
							<Route className="mt-1 size-5 text-primary" aria-hidden="true" />
							<div>
								<p className="font-semibold">Listen with intent</p>
								<p className="text-sm text-muted-foreground">
									After transcription, pick a related contrast set and compare how the words differ.
									Use the note field to keep track of words that need another review.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-4 rounded-3xl border border-dashed border-primary/40 bg-background/90 p-6 shadow-inner">
					<h3 className="text-lg font-semibold text-primary">More on the way</h3>
					<p className="text-sm text-muted-foreground">
						We are exploring progress trackers, personalized review decks, and mobile-friendly
						practice so that learners can continue from any device.
					</p>
					<Button asChild variant="outline" className="w-full">
						<Link href="mailto:hello@phonaria.app">Suggest a feature</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
