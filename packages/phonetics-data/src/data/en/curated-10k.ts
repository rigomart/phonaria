import curatedTop10kJson from "../../../data/en/curated/top-10k.json";
import type { CuratedWordData } from "./curated-1k";

/**
 * Top 10,000 most frequent English words with CMU pronunciations.
 * Covers ~95% of learner vocabulary. Lazy-loaded (~273KB).
 */
export const EnglishCuratedTop10k: CuratedWordData = curatedTop10kJson;
