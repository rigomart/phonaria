import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic, listTopics } from "@/lib/practice/topics";
import { PracticeExperience } from "../_components/practice-experience";

interface PracticeTopicPageProps {
	params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
	return listTopics().map((topic) => ({ topic: topic.id }));
}

export async function generateMetadata({ params }: PracticeTopicPageProps): Promise<Metadata> {
	const { topic: slug } = await params;
	const topic = getTopic(slug);
	if (!topic) return { title: "Practice", robots: { index: false, follow: true } };

	return {
		title: `${topic.display.heading} — Practice`,
		description: topic.display.description,
		robots: { index: false, follow: true },
	};
}

export default async function PracticeTopicPage({ params }: PracticeTopicPageProps) {
	const { topic: slug } = await params;
	if (!getTopic(slug)) notFound();

	// A TopicDefinition carries predicate functions, so it cannot cross the
	// server/client boundary — the client re-resolves it from the registry.
	return <PracticeExperience topicId={slug} />;
}
