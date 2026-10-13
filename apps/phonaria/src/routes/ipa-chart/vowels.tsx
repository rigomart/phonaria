import { createFileRoute } from "@tanstack/react-router";
import { VowelsContent } from "@/components/ipa-chart/vowels-content";
import { buildVowelsHead } from "@/lib/document-head";
import { createChartSoundSearchValidator } from "@/lib/ipa-chart/sound-search";

export const Route = createFileRoute("/ipa-chart/vowels")({
	validateSearch: createChartSoundSearchValidator("en-us", "vowels"),
	head: () => buildVowelsHead(),
	component: VowelsRoute,
});

function VowelsRoute() {
	const { sound } = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<VowelsContent
			selectedSound={sound}
			onSelectSound={(id) =>
				navigate({ search: { sound: id }, replace: sound !== undefined, resetScroll: false })
			}
			onCloseSound={() => navigate({ search: {}, replace: true, resetScroll: false })}
		/>
	);
}
