import { createFileRoute } from "@tanstack/react-router";
import { SoundsContent } from "@/components/sound-pages/sounds-content";
import { buildSoundsIndexHead } from "@/lib/document-head";

export const Route = createFileRoute("/sounds/")({
	head: () => buildSoundsIndexHead(),
	component: SoundsRoute,
});

function SoundsRoute() {
	return <SoundsContent />;
}
