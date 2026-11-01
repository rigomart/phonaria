import { createFileRoute } from "@tanstack/react-router";
import { AboutContent } from "@/components/about-content";
import { buildAboutHead } from "@/lib/document-head";
import { requireFlag } from "@/lib/require-flag";

export const Route = createFileRoute("/about")({
	beforeLoad: () => {
		requireFlag("about");
	},
	head: () => buildAboutHead(),
	component: AboutRoute,
});

function AboutRoute() {
	return <AboutContent />;
}
