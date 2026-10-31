import { createFileRoute } from "@tanstack/react-router";
import { AboutContent } from "@/components/about-content";
import { buildAboutHead } from "@/lib/document-head";

export const Route = createFileRoute("/about")({
	head: () => buildAboutHead(),
	component: AboutRoute,
});

function AboutRoute() {
	return <AboutContent />;
}
