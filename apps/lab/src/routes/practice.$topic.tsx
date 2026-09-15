import { createFileRoute } from "@tanstack/react-router";
import { getTopic } from "@/lib/practice/topics";
import { buildPracticeTopicHead, notFound } from "@/platform/tanstack";
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
