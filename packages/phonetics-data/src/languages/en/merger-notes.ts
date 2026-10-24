import { deepFreeze } from "../../shared/readonly";
import type { EnglishPhonemeSymbolId } from "../inventories";
import type { MergerNote } from "../types";

// Sources and caveats: docs/research/us-vowel-mergers.md.

const cotCaught = {
	id: "cot-caught",
	title: "Cot and caught",
	text: "Many Americans say *cot* and *caught* with the same vowel, usually the /ɑ/ of *father*. Linguists call this the cot–caught merger. It's common in the West and across Canada, and it has been spreading in the rest of the US. Both ways of speaking are ordinary American English. The examples here use a voice that keeps the two sounds apart, so you can hear the difference.",
} as const satisfies MergerNote;

const maryMarryMerry = {
	id: "mary-marry-merry",
	title: "Mary, marry and merry",
	text: "Before /ɹ/, many Americans say *Mary*, *marry* and *merry* the same way. People in parts of the Northeast, such as New York, Philadelphia and Boston, are more likely to keep the vowels apart. Both are normal American speech. If *marry* and *merry* sound alike in a recording, that's this merger, not a mistake.",
} as const satisfies MergerNote;

/** Notes on the vowel mergers each English sound takes part in, by phoneme ID. */
export const EnglishPhonemeMergerNotes: Readonly<
	Partial<Record<EnglishPhonemeSymbolId, ReadonlyArray<MergerNote>>>
> = deepFreeze({
	O: [cotCaught],
	AE: [maryMarryMerry],
	E: [maryMarryMerry],
} as const satisfies Partial<Record<EnglishPhonemeSymbolId, ReadonlyArray<MergerNote>>>);
