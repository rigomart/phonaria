import { createFileRoute } from "@tanstack/react-router";
import { PracticeExperience } from "@/app/practice/_components/practice-experience";
import { PracticeTopicLoading } from "@/app/practice/_components/practice-topic-loading";
import { getTopic } from "@/lib/practice/topics";
import { buildPracticeTopicHead, notFound } from "@/platform/tanstack";

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
