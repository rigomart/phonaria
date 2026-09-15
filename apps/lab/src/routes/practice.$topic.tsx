import { createFileRoute } from "@tanstack/react-router";
import { buildPracticeTopicHead } from "@/lib/document-head";
import { notFound } from "@/lib/navigation";
import { getTopic } from "@/lib/practice/topics";
import { PracticeExperience } from "@/practice/_components/practice-experience";
import { PracticeTopicLoading } from "@/practice/_components/practice-topic-loading";

export const Route = createFileRoute("/practice/$topic")({
	beforeLoad: ({ params }) => {
		if (!getTopic(params.topic)) notFound();
	},
	head: ({ params }) => buildPracticeTopicHead(getTopic(params.topic)),
	pendingComponent: PracticeTopicLoading,
	component: PracticeTopicRoute,
});

function PracticeTopicRoute() {
	const { topic } = Route.useParams();
	return <PracticeExperience topicId={topic} />;
}
