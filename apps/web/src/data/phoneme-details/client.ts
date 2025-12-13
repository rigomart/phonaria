import { useLocale } from "next-intl";
import { getPhonemeDetailsCopy } from "./index";

export function usePhonemeDetailsCopy() {
	return getPhonemeDetailsCopy(useLocale());
}
