import Link from "next/link";
import type { TopicDefinition } from "@/lib/practice/topics/types";
import { summarizeTopicSounds } from "../_lib/topic-sounds";

/** One topic on the picker: two written strings, the rest derived. */
export function TopicCard({ topic }: { topic: TopicDefinition }) {
	const { ipa, examples } = summarizeTopicSounds(topic.topicSounds);

	return (
		<li>
			<Link
				className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				href={`/practice/${topic.id}`}
			>
				<div className="flex items-center gap-2">
					<h2 className="font-display font-semibold">{topic.display.name}</h2>
					{ipa.map((symbol) => (
						<span
							// Screen readers cannot be trusted with IPA, and the name beside
							// it already identifies the sound.
							aria-hidden="true"
							className="rounded-md border border-border px-1.5 py-0.5 font-display text-sm"
							key={symbol}
						>
							{symbol}
						</span>
					))}
				</div>

				<p className="text-pretty text-muted-foreground text-sm">{topic.display.blurb}</p>

				{examples.length > 0 && (
					<p className="text-muted-foreground text-xs">Heard in {examples.join(", ")}</p>
				)}
			</Link>
		</li>
	);
}
