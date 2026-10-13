import { createFileRoute } from "@tanstack/react-router";
import { ConsonantsContent } from "@/components/ipa-chart/consonants-content";
import { buildConsonantsHead } from "@/lib/document-head";
import { createChartSoundSearchValidator } from "@/lib/ipa-chart/sound-search";

export const Route = createFileRoute("/ipa-chart/consonants")({
	validateSearch: createChartSoundSearchValidator("en-us", "consonants"),
	head: () => buildConsonantsHead(),
	component: ConsonantsRoute,
});

function ConsonantsRoute() {
	const { sound } = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<ConsonantsContent
			selectedSound={sound}
			// Opening adds a history entry, so Back closes the drawer; switching replaces it.
			onSelectSound={(id) =>
				navigate({ search: { sound: id }, replace: sound !== undefined, resetScroll: false })
			}
			onCloseSound={() => navigate({ search: {}, replace: true, resetScroll: false })}
		/>
	);
}
