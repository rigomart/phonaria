import { buttonVariants } from "@phonaria/ui/components/button";
import { ExternalLink, Play, Volume2 } from "lucide-react";
import { useId } from "react";
import { Link } from "@/components/link";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SpelledWord } from "@/components/spelled-word";
import { WordAudioButton } from "@/components/word-audio-button";
import { WordAudioForms } from "@/components/word-audio-forms";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { buildWiktionaryEntryUrl } from "@/lib/definition/word";
import { formatPercentage } from "@/lib/phoneme-frequency";
import { buildPublicAssetUrl } from "@/lib/site";
import { nameAddsToSymbol } from "@/lib/sound-pages";
import { cn } from "@/lib/utils";
import type { ShareSegment, SoundPart, WordPageView } from "@/lib/word-page-content";

const ACCENT = "en-us" as const;
const MARK = "underline decoration-2 underline-offset-4";
const TEXT_LINK =
	"rounded-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

/**
 * A word's own page: its IPA and recordings, then one card per sound in the
 * word, with the letters that spell it, how usual that spelling is for the
 * sound, other words spelled the same way and the minimal pairs where that
 * sound changes. Everything comes from the data; nothing is written per word.
 */
export function WordPageContent({ view }: { view: WordPageView }) {
	const titleId = useId();
	return (
		<article
			aria-labelledby={titleId}
			className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-6"
		>
			<header className="flex flex-col items-start gap-3 enter-rise">
				<h1 id={titleId} className="font-bold font-display text-3xl tracking-tight sm:text-4xl">
					{view.name} in IPA: <span className="whitespace-nowrap">/{view.ipa}/</span>
				</h1>
				<div className="flex flex-wrap items-center gap-3">
					<WordAudioForms
						targetAccent={ACCENT}
						word={view.word}
						pronunciation={view.pronunciation}
					/>
					<a
						href={buildWiktionaryEntryUrl(view.word)}
						target="_blank"
						rel="noopener noreferrer"
						className={cn(
							TEXT_LINK,
							"inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
						)}
					>
						Wiktionary
						<ExternalLink aria-hidden="true" className="size-3.5" />
						<span className="sr-only"> (opens in a new tab)</span>
					</a>
				</div>
			</header>

			<ol aria-label="Sounds" className="flex flex-col gap-2 enter-rise enter-delay-40">
				{view.sounds.map((part, index) => (
					<SoundCard key={`${index}-${part.sound.phonemeId}`} part={part} />
				))}
			</ol>
		</article>
	);
}

/** One sound of the word; a spelling that is rare for its sound is outlined. */
function SoundCard({ part }: { part: SoundPart }) {
	return (
		<li
			data-rare={part.rare ? "" : undefined}
			className={cn(
				"flex gap-4 rounded-2xl bg-background-strong p-3 shadow-xs",
				part.rare && "ring-2 ring-foreground",
			)}
		>
			<div className="flex w-18 shrink-0 flex-col items-center justify-center gap-1.5 border-r border-border pr-3">
				<span className="font-display text-2xl font-semibold text-foreground">{part.letters}</span>
				<SoundLink part={part} />
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="flex items-center gap-2">
					<SoundPlayButton part={part} />
					{nameAddsToSymbol(part.sound.phonemeId) ? (
						<span className="text-sm font-medium text-foreground">{part.name}</span>
					) : null}
					{part.stressed ? null : <span className="text-xs text-muted-foreground">unstressed</span>}
				</div>
				<SpellingMeter part={part} />
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
					<ExampleWords part={part} />
					<ContrastLinks part={part} />
				</div>
			</div>
		</li>
	);
}

/** The sound's symbol as a button-styled link to its page. */
function SoundLink({ part }: { part: SoundPart }) {
	return (
		<Link
			href={part.sound.path}
			aria-label={`${part.name} /${part.sound.ipa}/`}
			className={cn(buttonVariants({ size: "sm", variant: "outline" }), "font-display text-lg")}
		>
			/{part.sound.ipa}/
		</Link>
	);
}

/** Plays the sound's own recording; nothing where the sound has none (diphthongs). */
function SoundPlayButton({ part }: { part: SoundPart }) {
	const src = part.audioPath ? buildPublicAssetUrl(part.audioPath) : null;
	const { play, status } = useAudioManager(src ?? "");
	if (!src) return null;
	const busy = status === "loading" || status === "playing";
	return (
		<button
			type="button"
			aria-label={`Play ${part.name}`}
			data-status={status}
			onClick={() => {
				if (!busy) play();
			}}
			className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[status=loading]:animate-pulse data-[status=playing]:bg-accent motion-reduce:transition-none motion-reduce:data-[status=loading]:animate-none"
		>
			<Play aria-hidden="true" className="size-3.5" />
		</button>
	);
}

/** "1.0% of /f/ sounds in everyday speech are spelled gh." */
function shareSentence(part: SoundPart): string {
	return `${formatPercentage(part.percentage ?? 0)} of /${part.sound.ipa}/ sounds in everyday speech are spelled ${part.letters}.`;
}

function roundedShare(percentage: number): string {
	return percentage >= 1 ? `${Math.round(percentage)}%` : formatPercentage(percentage);
}

function meterLabel(part: SoundPart): string {
	const common = part.shares
		.filter((segment) => segment.spelling && !segment.own)
		.map((segment) => `${segment.spelling} ${formatPercentage(segment.percentage)}`)
		.join(", ");
	const rare = part.rare ? "Rare spelling. " : "";
	return common
		? `${rare}${shareSentence(part)} Other common spellings: ${common}.`
		: `${rare}${shareSentence(part)}`;
}

/**
 * How usual the spelling is for the sound: its share filled in from the left, then the
 * sound's other spellings. A rare one's sliver gets a marker so it stays visible.
 */
function SpellingMeter({ part }: { part: SoundPart }) {
	if (part.percentage === null) return null;
	const segments = [...part.shares.filter((s) => s.own), ...part.shares.filter((s) => !s.own)];
	return (
		<div className="flex min-w-0 items-center gap-2" title={shareSentence(part)}>
			<div
				role="img"
				aria-label={meterLabel(part)}
				className="flex h-4 min-w-0 flex-1 gap-px overflow-hidden rounded-sm"
			>
				{segments.map((segment) => (
					<MeterSegment key={segment.spelling ?? "rest"} segment={segment} />
				))}
			</div>
			<span
				aria-hidden="true"
				className={cn(
					"shrink-0 whitespace-nowrap text-xs tabular-nums",
					part.rare ? "font-semibold text-foreground" : "text-muted-foreground",
				)}
			>
				spells <span className="font-display">/{part.sound.ipa}/</span>{" "}
				{roundedShare(part.percentage)} of the time
			</span>
		</div>
	);
}

function MeterSegment({ segment }: { segment: ShareSegment }) {
	return (
		<span
			style={{ flexGrow: segment.percentage }}
			className={cn(
				"relative basis-0",
				segment.own ? "bg-foreground" : segment.spelling ? "bg-secondary" : "bg-muted",
			)}
		>
			{segment.own ? <span className="absolute inset-y-0 left-0 w-0.5 bg-foreground" /> : null}
		</span>
	);
}

/** Other words spelled the same way for the sound; a word with its own page links to it. */
function ExampleWords({ part }: { part: SoundPart }) {
	if (part.examples.length === 0) return null;
	return (
		<ul className="-ml-1.5 flex flex-wrap gap-x-1 text-sm">
			{part.examples.map(({ word, spelled, path }) => (
				<li key={word}>
					{path ? (
						<span className="inline-flex items-center">
							<Link href={path} className={cn(TEXT_LINK, "px-1.5 py-1 text-foreground")}>
								<SpelledWord spelled={spelled} markClassName={MARK} />
							</Link>
							<WordAudioButton
								targetAccent={ACCENT}
								word={word}
								className="inline-flex items-center rounded-sm py-1 pr-1.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
							>
								<Volume2 aria-hidden="true" className="size-3" />
							</WordAudioButton>
						</span>
					) : (
						<PlayableWordCell
							targetAccent={ACCENT}
							word={word}
							className="rounded-sm px-1.5 py-1 text-foreground"
						>
							<SpelledWord spelled={spelled} markClassName={MARK} />
						</PlayableWordCell>
					)}
				</li>
			))}
		</ul>
	);
}

/** The minimal pairs where this sound is the one that changes, each linking to its contrast page. */
function ContrastLinks({ part }: { part: SoundPart }) {
	if (part.contrasts.length === 0) return null;
	return (
		<ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
			{part.contrasts.map(({ path, other, theirs }) => (
				<li key={`${path}-${other}`}>
					<Link
						href={path}
						className={cn(TEXT_LINK, "text-muted-foreground hover:text-foreground")}
					>
						vs <span className="font-display text-foreground">/{theirs.ipa}/</span> {other}
					</Link>
				</li>
			))}
		</ul>
	);
}
