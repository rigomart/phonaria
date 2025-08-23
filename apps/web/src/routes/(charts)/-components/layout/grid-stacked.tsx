import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { PhonemeGridLayout } from "@/routes/(charts)/-components/core/phoneme-grid";
import type { ConsonantGrid } from "../../-hooks/use-consonant-grid";
import type { VowelGrid } from "../../-hooks/use-vowel-grid";

type GridStackedProps =
	| {
			type: "consonant";
			grid: ConsonantGrid;
			onSelect: (phoneme: ConsonantPhoneme) => void;
	  }
	| {
			type: "vowel";
			grid: VowelGrid;
			onSelect: (phoneme: VowelPhoneme) => void;
	  };

export function GridStacked(props: GridStackedProps) {
	return <PhonemeGridLayout {...props} />;
}
