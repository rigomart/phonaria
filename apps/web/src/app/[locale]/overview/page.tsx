import type { Metadata } from "next";

import { CoreModulesSection } from "./_components/core-modules-section";
import { ToolCombinationSection } from "./_components/tool-combination-section";

export const metadata: Metadata = {
	title: "Phonaria tools overview",
	description:
		"Preview the grapheme-to-phoneme workspace, IPA reference chart, and sound contrast activities available in Phonaria.",
};

export default function FeaturesRoute() {
	return (
		<div className="flex flex-1 flex-col bg-background">
			<CoreModulesSection />
			<ToolCombinationSection />
		</div>
	);
}
