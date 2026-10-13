import { createFileRoute } from "@tanstack/react-router";
import { FrequencyContent } from "@/components/ipa-chart/frequency-content";
import { buildFrequencyHead } from "@/lib/document-head";
import { createChartSoundSearchValidator } from "@/lib/ipa-chart/sound-search";

export const Route = createFileRoute("/ipa-chart/frequency")({
	validateSearch: createChartSoundSearchValidator("en-us", "all"),
	head: () => buildFrequencyHead(),
	component: FrequencyRoute,
});

function FrequencyRoute() {
	const { sound } = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<FrequencyContent
			selectedSound={sound}
			onSelectSound={(id) =>
				navigate({ search: { sound: id }, replace: sound !== undefined, resetScroll: false })
			}
			onCloseSound={() => navigate({ search: {}, replace: true, resetScroll: false })}
		/>
	);
}
