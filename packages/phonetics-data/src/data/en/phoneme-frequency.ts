import phonemeFrequencyJson from "../../../data/en/phoneme-frequency.json";
import type { PhonemeFrequencyPayload } from "../../dict/types";

// The JSON infers phonemeId as string; the generator script reads IDs from the
// curated dictionary, and the integrity test checks them against the inventory.
export const EnglishPhonemeFrequencyData = phonemeFrequencyJson as PhonemeFrequencyPayload;
