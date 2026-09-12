import type { Metadata } from "next";
import { PracticeActivity } from "@/lib/practice/activity";
import { listTopics } from "@/lib/practice/topics";
import { TopicCard } from "./_components/topic-card";

export const metadata: Metadata = {
	title: PracticeActivity.name,
	description: PracticeActivity.description,
};

/** Registry order is deliberate teaching order, not an alphabetical listing. */
export default function PracticePage() {
	const topics = listTopics();

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold font-display text-2xl tracking-tight sm:text-3xl">
					{PracticeActivity.name}
				</h1>
				<p className="text-pretty text-muted-foreground text-sm">{PracticeActivity.description}</p>
			</div>

			<ul className="flex flex-col gap-3">
				{topics.map((topic) => (
					<TopicCard key={topic.id} topic={topic} />
				))}
			</ul>
		</div>
	);
}
