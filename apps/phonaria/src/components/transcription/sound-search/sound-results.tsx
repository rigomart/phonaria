import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { RotateCcw } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { Disclaimer } from "@/components/disclaimer";
import {
	describeMatchCount,
	SEARCHED_WORD_COUNT,
	type SoundId,
	type SoundMatch,
	soundsToIpa,
} from "@/lib/sound-search/search";
import { cn } from "@/lib/utils";
import { useSoundSearch } from "./use-sound-search";

const SHOWN_MATCHES = 60;

/** Stays while the input switches to text, until the next search. */
export function SoundResults({ sounds }: { sounds: readonly SoundId[] }) {
	const { status, find, retry } = useSoundSearch();
	const result = useMemo(() => find(sounds), [find, sounds]);

	if (status === "error") {
		return (
			<Message>
				<span role="alert">The word list didn't load. Check your connection and try again.</span>
				<Button variant="outline" size="sm" onClick={retry}>
					<RotateCcw data-icon="inline-start" />
					Try again
				</Button>
			</Message>
		);
	}

	if (sounds.length === 0) {
		return (
			<Message>
				Pick the sounds you heard, starting with the first. Words that start with them, from the{" "}
				{SEARCHED_WORD_COUNT.toLocaleString("en-US")} most common in English, show up here.
			</Message>
		);
	}

	if (!result) {
		return (
			<Message>
				<Spinner />
			</Message>
		);
	}

	const total = result.matches.length;

	if (total === 0) {
		return (
			<Message>
				<span>
					None of the {SEARCHED_WORD_COUNT.toLocaleString("en-US")} most common English words start
					with <PickedSounds sounds={sounds} />.
				</span>
				<SoundSearchNote />
			</Message>
		);
	}

	return (
		<section aria-label="Words found" className="mx-auto w-full max-w-2xl px-4 py-4 enter-fade">
			<p className="mb-3 px-3 text-sm text-muted-foreground">
				{describeMatchCount(total)} <PickedSounds sounds={sounds} />
			</p>
			<ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{result.matches.slice(0, SHOWN_MATCHES).map((match) => (
					<li key={match.word}>
						<MatchButton match={match} picked={sounds.length} />
					</li>
				))}
			</ul>
			{total > SHOWN_MATCHES ? (
				<p className="mt-4 text-center text-xs text-muted-foreground">
					Showing the {SHOWN_MATCHES} most common. Add a sound to narrow it down.
				</p>
			) : null}
			<SoundSearchNote className="mt-4 text-center" />
		</section>
	);
}

function MatchButton({ match, picked }: { match: SoundMatch; picked: number }) {
	const { openWord } = useSoundSearch();
	const matched = soundsToIpa(match.pronunciation.slice(0, picked));
	const rest = soundsToIpa(match.pronunciation.slice(picked));

	return (
		<button
			type="button"
			onClick={() => openWord(match.word)}
			aria-label={`${match.word}, /${matched}${rest}/${match.exact ? ", exact match" : ""}`}
			className={cn(
				"flex w-full items-baseline justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:border-primary",
				match.exact && "border-primary",
			)}
		>
			<span className="truncate font-medium">{match.word}</span>
			<span className="shrink-0 text-sm text-muted-foreground">
				/<span className="text-foreground">{matched}</span>
				{rest}/
			</span>
		</button>
	);
}

/** Keeps the IPA on one line; a browser would otherwise break after the opening slash. */
export function PickedSounds({ sounds }: { sounds: readonly SoundId[] }) {
	return <span className="whitespace-nowrap">/{soundsToIpa(sounds)}/</span>;
}

function SoundSearchNote({ className }: { className?: string }) {
	return (
		<Disclaimer
			className={className}
			title="About these matches"
			points={[
				"Sounds come from the CMU Pronouncing Dictionary, which lists US English pronunciations.",
				"Its pronunciations follow one common US accent.",
				"If you heard a word said a different way, it may start with different sounds here, or not show up at all.",
			]}
			source="cmu"
		>
			The words come from a US dictionary.
		</Disclaimer>
	);
}

function Message({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 pt-6 pb-8 text-center text-sm text-muted-foreground enter-fade">
			{children}
		</div>
	);
}
