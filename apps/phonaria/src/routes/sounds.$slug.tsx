import { createFileRoute } from "@tanstack/react-router";
import { SoundPageContent } from "@/components/sound-pages/sound-page-content";
import { buildSoundHead } from "@/lib/document-head";
import { notFound } from "@/lib/navigation";
import { getPhonemeIdForSoundSlug } from "@/lib/sound-pages";

export const Route = createFileRoute("/sounds/$slug")({
	beforeLoad: ({ params }) => {
		if (!getPhonemeIdForSoundSlug(params.slug)) notFound();
	},
	head: ({ params }) => {
		const phonemeId = getPhonemeIdForSoundSlug(params.slug);
		return phonemeId ? buildSoundHead(phonemeId) : { meta: [] };
	},
	component: SoundRoute,
});

function SoundRoute() {
	const { slug } = Route.useParams();
	const phonemeId = getPhonemeIdForSoundSlug(slug);
	return phonemeId ? <SoundPageContent phonemeId={phonemeId} /> : null;
}
