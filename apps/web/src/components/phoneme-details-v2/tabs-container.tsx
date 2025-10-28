"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhonemeDetailsContext } from "./index";
import { TabArticulation } from "./tab-articulation";
import { TabHowTo } from "./tab-how-to";
import { TabPractice } from "./tab-practice";

export function PhonemeDetailsTabs() {
	const { phoneme, layout } = usePhonemeDetailsContext();

	const hasHowTo = Boolean(phoneme.guide);
	const hasArticulation = Boolean(phoneme.category);
	const defaultTab = hasHowTo ? "how-to" : hasArticulation ? "articulation" : "practice";

	const maxHeight = layout === "compact" ? 400 : layout === "comfortable" ? 280 : 300;

	return (
		<Tabs defaultValue={defaultTab} className="w-full">
			<TabsList className="w-full grid grid-cols-3">
				<TabsTrigger value="how-to" disabled={!hasHowTo}>
					How to
				</TabsTrigger>
				<TabsTrigger value="articulation" disabled={!hasArticulation}>
					Allophones
				</TabsTrigger>
				<TabsTrigger value="practice">Practice</TabsTrigger>
			</TabsList>

			<TabsContent value="how-to" className="mt-3">
				<TabHowTo />
			</TabsContent>

			<TabsContent value="articulation" className="mt-3">
				<div className="w-full overflow-auto pr-3" style={{ maxHeight: `${maxHeight}px` }}>
					<TabArticulation />
				</div>
			</TabsContent>

			<TabsContent value="practice" className="mt-3">
				<div className="w-full overflow-auto pr-3" style={{ maxHeight: `${maxHeight}px` }}>
					<TabPractice />
				</div>
			</TabsContent>
		</Tabs>
	);
}
