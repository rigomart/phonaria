import { Link } from "@/components/link";
import { flags } from "@/lib/flags";
import { enterDelay, stagger } from "@/lib/motion";
import { PracticeActivity } from "@/lib/practice/activity";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { listTopics } from "@/lib/practice/topics";
import { TopicCard } from "./topic-card";

/** Registry order is deliberate teaching order, not an alphabetical listing. */
export function PracticeIndexContent() {
	const topics = listTopics();
	const showMinimalPairs = flags.isEnabled("speech");

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold font-display text-2xl tracking-tight sm:text-3xl enter-rise">
					{PracticeActivity.name}
				</h1>
				<p className="text-pretty text-muted-foreground text-sm enter-rise enter-delay-40">
					{PracticeActivity.description}
				</p>
			</div>

			<ul className="flex flex-col gap-3">
				{topics.map((topic, index) => (
					<TopicCard
						key={topic.id}
						topic={topic}
						style={enterDelay(stagger(index, { start: 80, step: 40, cap: 6 }))}
					/>
				))}
				{showMinimalPairs ? (
					<li
						className="enter-rise"
						style={enterDelay(stagger(topics.length, { start: 80, step: 40, cap: 6 }))}
					>
						<Link
							className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							href={MinimalPairActivity.path}
						>
							<h2 className="font-display font-semibold">{MinimalPairActivity.name}</h2>
							<p className="text-pretty text-muted-foreground text-sm">
								{MinimalPairActivity.description}
							</p>
						</Link>
					</li>
				) : null}
			</ul>
		</div>
	);
}
