import { InputGroupButton } from "@phonaria/ui/components/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { prefetchSoundSearch, useSoundSearch } from "./use-sound-search";

export function SearchModeToggle() {
	const { mode, setMode } = useSoundSearch();
	const active = mode === "sounds";
	const label = active ? "Type text instead" : "Find a word by its sounds";

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<InputGroupButton
						size="icon-sm"
						variant={active ? "secondary" : "ghost"}
						aria-pressed={active}
						aria-label="Find a word by its sounds"
						onPointerEnter={active ? undefined : prefetchSoundSearch}
						onFocus={active ? undefined : prefetchSoundSearch}
						onClick={() => setMode(active ? "text" : "sounds")}
						className="text-base"
					/>
				}
			>
				ə
			</TooltipTrigger>
			<TooltipContent side="bottom">{label}</TooltipContent>
		</Tooltip>
	);
}
