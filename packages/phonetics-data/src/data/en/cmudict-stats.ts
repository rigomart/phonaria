import cmudictStatsJson from "../../../data/en/dict/cmudict-stats.json";
import type { CmudictStatsPayload } from "../../dict/types";

// CmudictStatsPayload uses PhonemeSymbolId (literal union) for phonemeId fields,
// which TypeScript can only infer as string from JSON. The generator script guarantees
// valid phoneme IDs, so a type assertion is needed at this trust boundary.
export const EnglishCmudictStatsData = cmudictStatsJson as CmudictStatsPayload;
