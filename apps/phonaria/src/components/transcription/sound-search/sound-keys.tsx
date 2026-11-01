import { getIpaForPhonemeId, getLanguagePhonemeIds } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@phonaria/ui/components/toggle-group";
import { useState } from "react";
import { type SoundId, soundsToIpa } from "@/lib/sound-search/search";
import { cn } from "@/lib/utils";
import { useSoundSearch } from "./use-sound-search";

type Group = "consonants" | "vowels";

const GROUPS: Record<Group, readonly SoundId[]> = {
	consonants: getLanguagePhonemeIds("en-us", "consonants"),
	vowels: getLanguagePhonemeIds("en-us", "vowels"),
};

export function SoundKeys({ onDone }: { onDone: () => void }) {
	const [group, setGroup] = useState<Group>("consonants");

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-2 pl-1">
				<ToggleGroup
					size="sm"
					spacing={1}
					value={[group]}
					onValueChange={(value) => {
						const next = value[0];
						if (next === "consonants" || next === "vowels") setGroup(next);
					}}
					aria-label="Sounds to show"
				>
					<ToggleGroupItem value="consonants">Consonants</ToggleGroupItem>
					<ToggleGroupItem value="vowels">Vowels</ToggleGroupItem>
				</ToggleGroup>
				<Button variant="ghost" size="sm" onClick={onDone}>
					Done
				</Button>
			</div>
			<StackedKeyGroups visible={group} />
			<KeysStatus />
		</div>
	);
}

function StackedKeyGroups({ visible }: { visible: Group }) {
	return (
		<div className="grid">
			{(["consonants", "vowels"] as const).map((name) => (
				<div
					key={name}
					inert={name !== visible}
					className={cn(
						"col-start-1 row-start-1 grid grid-cols-6 content-start gap-1 sm:grid-cols-8",
						name !== visible && "invisible",
					)}
				>
					{GROUPS[name].map((id) => (
						<SoundKey key={id} id={id} />
					))}
				</div>
			))}
		</div>
	);
}

function SoundKey({ id }: { id: SoundId }) {
	const { add, result, examples } = useSoundSearch();
	const symbol = getIpaForPhonemeId(id);
	const example = examples.get(id);
	const count = result?.next.get(id) ?? 0;
	const canPick = result !== null && count > 0;

	return (
		<button
			type="button"
			onClick={() => add(id)}
			disabled={!canPick}
			aria-label={`/${symbol}/${example ? `, as in ${example}` : ""}${result ? `, ${count} ${count === 1 ? "word" : "words"}` : ""}`}
			className="flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl leading-none transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-muted disabled:pointer-events-none disabled:opacity-40"
		>
			<span className="text-lg">{symbol}</span>
			<span className="max-w-full truncate px-0.5 text-xs text-muted-foreground">
				{example ?? " "}
			</span>
		</button>
	);
}

function KeysStatus() {
	const { sounds, status, result, retry } = useSoundSearch();

	let text: string;
	if (status === "error") text = "We couldn't load the word list.";
	else if (!result) text = "Loading words...";
	else if (sounds.length === 0) text = "Start with the first sound of the word.";
	else {
		const total = result.matches.length;
		text = `${total.toLocaleString()} ${total === 1 ? "word starts" : "words start"} with /${soundsToIpa(sounds)}/`;
	}

	return (
		<div className="flex min-h-8 items-center gap-2 px-2 text-xs text-muted-foreground">
			{status === "loading" ? <Spinner className="size-3" /> : null}
			<span aria-live="polite">{text}</span>
			{status === "error" ? (
				<Button variant="ghost" size="xs" onClick={retry}>
					Try again
				</Button>
			) : null}
		</div>
	);
}
