import { createFileRoute } from "@tanstack/react-router";
import { SoundPage } from "@/components/sound/sound-page";
import { buildSoundHead } from "@/lib/document-head";
import {
	getChartSection,
	getSoundPath,
	getSoundSlug,
	parseSoundSlug,
} from "@/lib/ipa-chart/sound-route";
import { notFound, redirect } from "@/lib/navigation";

const targetAccent = "en-us";

/**
 * One page per sound: `/ipa-chart/t`. Unknown sounds get the not-found page, and
 * other letter cases redirect to the lowercase slug.
 */
export const Route = createFileRoute("/ipa-chart/$sound")({
	beforeLoad: ({ params }) => {
		const phonemeId = parseSoundSlug(params.sound, targetAccent);
		if (!phonemeId) notFound();
		if (params.sound !== getSoundSlug(phonemeId)) redirect(getSoundPath(phonemeId), 308);
		return { phonemeId };
	},
	head: ({ params }) => {
		const phonemeId = parseSoundSlug(params.sound, targetAccent);
		return phonemeId ? buildSoundHead(phonemeId) : {};
	},
	component: SoundRoute,
});

function SoundRoute() {
	const { phonemeId } = Route.useRouteContext();
	return (
		<SoundPage
			key={phonemeId}
			targetAccent={targetAccent}
			phonemeId={phonemeId}
			section={getChartSection(phonemeId)}
		/>
	);
}
