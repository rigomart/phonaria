import { createFileRoute } from "@tanstack/react-router";
import { SoundPageContent } from "@/components/sound-pages/sound-page-content";
import { SoundsContent } from "@/components/sound-pages/sounds-content";
import { buildSoundHead, buildSoundsIndexHead } from "@/lib/document-head";
import { notFound } from "@/lib/navigation";
import { getPhonemeIdForSoundSlug } from "@/lib/sound-pages";

/** One route serves the list and every sound page: two routes add Worker chunks past the #201 module guardrail. */
export const Route = createFileRoute("/sounds/{-$slug}")({
	beforeLoad: ({ params }) => {
		if (params.slug && !getPhonemeIdForSoundSlug(params.slug)) notFound();
	},
	head: ({ params }) => {
		const phonemeId = params.slug ? getPhonemeIdForSoundSlug(params.slug) : undefined;
		return phonemeId ? buildSoundHead(phonemeId) : buildSoundsIndexHead();
	},
	component: SoundsRoute,
});

function SoundsRoute() {
	const { slug } = Route.useParams();
	if (!slug) return <SoundsContent />;
	const phonemeId = getPhonemeIdForSoundSlug(slug);
	return phonemeId ? <SoundPageContent phonemeId={phonemeId} /> : null;
}
