import type { Metadata } from "next";

import { CoreModulesSection } from "./_components/core-modules-section";
import { ToolCombinationSection } from "./_components/tool-combination-section";

export const metadata: Metadata = {
	title: "Phonix tools overview",
	description:
		"Preview the grapheme-to-phoneme workspace, IPA reference chart, and minimal pair activities available in Phonix.",
};

export default function FeaturesRoute() {
	return (
		<div className="flex flex-1 flex-col bg-background">
			<CoreModulesSection />
			<ToolCombinationSection />
		</div>
	);
}
