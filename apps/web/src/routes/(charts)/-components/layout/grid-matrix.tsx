import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { PhonemeMatrix } from "@/routes/(charts)/-components/core/phoneme-matrix";
import type { ConsonantGrid } from "../../-hooks/use-consonant-grid";
import type { VowelGrid } from "../../-hooks/use-vowel-grid";

type GridMatrixProps =
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

export function GridMatrix(props: GridMatrixProps) {
	return <PhonemeMatrix {...props} />;
}
