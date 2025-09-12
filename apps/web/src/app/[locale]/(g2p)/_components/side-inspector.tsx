"use client";

import { useEffect, useState } from "react";

import { useDictionaryStore } from "../_store/dictionary-store";
import { useG2PStore } from "../_store/g2p-store";
import { DefinitionCompactBlock } from "./definition-compact-block";
import { PhonemeCompactBlock } from "./phoneme-compact-block";

export function SideInspector() {
	const { selectedWord } = useDictionaryStore();
	const { selectedPhoneme } = useG2PStore();

	const [expanded, setExpanded] = useState<"definition" | "phoneme" | null>(null);

	// Auto-expansion based on selection
	useEffect(() => {
		if (selectedPhoneme) {
			setExpanded("phoneme");
			return;
		}
		if (selectedWord) {
			setExpanded("definition");
			return;
		}
		setExpanded(null);
	}, [selectedPhoneme, selectedWord]);

	return (
		<div className="flex flex-col gap-4">
			<DefinitionCompactBlock
				expanded={expanded === "definition"}
				onToggle={() => setExpanded(expanded === "definition" ? null : "definition")}
			/>
			<PhonemeCompactBlock
				expanded={expanded === "phoneme"}
				onToggle={() => setExpanded(expanded === "phoneme" ? null : "phoneme")}
			/>
		</div>
	);
}
