import { G2PInputForm } from "./g2p-input-form";
import { SearchModeToggle } from "./sound-search/search-mode-toggle";
import { SoundInputForm } from "./sound-search/sound-input-form";
import { useSoundSearch } from "./sound-search/use-sound-search";

/** The input on the homepage and /search: text, or sounds behind `FLAG_SOUND_SEARCH`. */
export function Composer() {
	const { enabled, mode } = useSoundSearch();
	const toggle = enabled ? <SearchModeToggle /> : undefined;
	return mode === "sounds" ? (
		<SoundInputForm leading={toggle} />
	) : (
		<G2PInputForm leading={toggle} />
	);
}
