import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/components/link";
import { SpelledWord } from "@/components/spelled-word";
import { cn } from "@/lib/utils";
import { PlayableWord } from "./playable-word";
import type { SoundSummary } from "./sound";
import { SoundTile } from "./sound-tile";

const TITLE_CLASS = "font-display text-lg leading-snug font-semibold tracking-tight text-balance";

/**
 * The sound's name as the heading of the container that shows it: an h2 in a
 * drawer or panel, the h1 of a page of its own. A technical label alone gets
 * its symbol read first; an everyday name stands alone, its symbol in the tile.
 * With `href` the name links to the sound's own page.
 */
export function SoundHeading({
	sound,
	titleId,
	as: Heading = "h2",
	href,
}: {
	sound: SoundSummary;
	titleId: string;
	as?: "h1" | "h2";
	href?: string;
}) {
	return (
		<Heading
			id={titleId}
			tabIndex={-1}
			className={cn(TITLE_CLASS, "outline-none", Heading === "h1" && "text-2xl sm:text-3xl")}
		>
			{sound.label ? null : <span className="sr-only">{sound.ipa}, </span>}
			{href ? (
				<Link
					href={href}
					title="Open the sound's page"
					className="inline-flex items-center gap-1.5 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
				>
					{sound.name}
					<ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
				</Link>
			) : (
				sound.name
			)}
		</Heading>
	);
}

/**
 * What the sound is and what it sounds like: symbol, name, type with an
 * example word and a link to the sound's own page. The symbol plays the
 * sound, the example word plays the word. Both levels open with it, so the
 * sound keeps its shape when the details expand. Hosts show how common the
 * sound is below it.
 *
 * On the drawer's compact level `onExpand` turns the name into a button that
 * opens the full view; it keeps the heading's size, so nothing moves when the
 * drawer expands. `action` is the corner control (close); `titleId` labels the
 * surrounding dialog.
 */
export function SoundHeader({
	sound,
	titleId,
	action,
	showExample = true,
	onExpand,
}: {
	sound: SoundSummary;
	titleId: string;
	action?: ReactNode;
	/** Off in the full view: its Spelling section pairs every example word with its spelling. */
	showExample?: boolean;
	onExpand?: () => void;
}) {
	const subtitle = (
		<span className="text-sm text-muted-foreground">
			{sound.label ? <span className="block">{sound.label}</span> : null}
			{sound.typeLabel}
			{showExample && sound.example ? (
				<>
					{" · as in "}
					<PlayableWord targetAccent={sound.targetAccent} word={sound.example.word}>
						<SpelledWord spelled={sound.example.spelled} />
					</PlayableWord>
				</>
			) : null}
		</span>
	);
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start gap-2">
				<div className="flex min-w-0 flex-1 items-start gap-4">
					<SoundTile ipa={sound.ipa} name={sound.name} audioPath={sound.audioPath} />
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						{onExpand ? (
							// A button holds no heading, so the name is a plain label here; the dialog
							// still takes it as its title through `titleId`.
							<button
								type="button"
								onClick={onExpand}
								aria-label={`More about ${sound.label ? sound.name : `${sound.ipa}: ${sound.name}`}`}
								className="group/expand -mx-2 -my-1 flex cursor-pointer items-center gap-1 self-start rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
							>
								<span id={titleId} className={TITLE_CLASS}>
									{sound.name}
								</span>
								<ChevronRight
									aria-hidden="true"
									className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/expand:translate-x-0.5 motion-reduce:transition-none"
								/>
							</button>
						) : (
							<SoundHeading sound={sound} titleId={titleId} href={sound.pagePath} />
						)}
						<p>{subtitle}</p>
					</div>
				</div>
				{action}
			</div>
		</div>
	);
}

/**
 * Where focus goes to name the sound: the compact level's expand button, which
 * holds the title, or the full view's heading.
 */
export function soundTitleTarget(titleId: string): HTMLElement | null {
	const title = document.getElementById(titleId);
	return title?.closest("button") ?? title;
}
