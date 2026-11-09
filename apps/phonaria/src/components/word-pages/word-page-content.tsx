import { ExternalLink } from "lucide-react";
import { useId } from "react";
import { Link } from "@/components/link";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SpelledWord } from "@/components/spelled-word";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { WordAudioForms } from "@/components/word-audio-forms";
import { buildWiktionaryEntryUrl } from "@/lib/definition/word";
import { formatPercentage } from "@/lib/phoneme-frequency";
import { cn } from "@/lib/utils";
import type {
	LetterGroup,
	ShareSegment,
	UnusualSpelling,
	WordPageView,
	WordPair,
	WordSound,
} from "@/lib/word-page-content";

const ACCENT = "en-us" as const;
const MARK = "underline decoration-2 underline-offset-4";
const SOUND_LINK =
	"rounded-sm font-display text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";
/** A share segment labels itself only when it is wide enough to hold its spelling. */
const LABEL_FROM_PERCENTAGE = 8;

/**
 * A word's own page: its IPA and recordings, the letters that spell each of its
 * sounds, how rare its rare spellings are among their sound's spellings, and the
 * minimal pairs it is in. Everything comes from the data; nothing is written per word.
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
						className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
					>
						Wiktionary
						<ExternalLink aria-hidden="true" className="size-3.5" />
						<span className="sr-only"> (opens in a new tab)</span>
					</a>
				</div>
				<SyntheticVoiceNote targetAccent={ACCENT} words={[view.word]} />
			</header>

			<div className="flex flex-col gap-4 enter-rise enter-delay-40">
				<LetterBreakdown letters={view.letters} />
				{view.unusual.map((spelling) => (
					<UnusualSpellingRow
						key={`${spelling.spelling}-${spelling.sound.phonemeId}`}
						spelling={spelling}
					/>
				))}
			</div>

			{view.pairs.length > 0 ? <Pairs word={view.word} pairs={view.pairs} /> : null}
		</article>
	);
}

function SoundLink({ sound }: { sound: WordSound }) {
	return (
		<Link href={sound.path} className={SOUND_LINK}>
			/{sound.ipa}/
		</Link>
	);
}

/** Each group of letters over the sound it spells, in word order; rare spellings stand out. */
function LetterBreakdown({ letters }: { letters: readonly LetterGroup[] }) {
	return (
		<ol aria-label="Letters and their sounds" className="flex flex-wrap gap-1.5">
			{letters.map(({ letters: text, sounds, rare }, index) => (
				<li
					key={`${index}-${text}`}
					data-rare={rare ? "" : undefined}
					className={cn(
						"flex min-w-14 flex-col items-center gap-1 rounded-xl bg-background-strong px-3 py-2 shadow-xs",
						rare && "ring-2 ring-foreground",
					)}
				>
					<span className="font-display text-xl font-semibold text-foreground">{text}</span>
					{sounds.length === 0 ? (
						<span className="text-sm text-muted-foreground">silent</span>
					) : (
						<span className="flex gap-1 text-base">
							{sounds.map((sound) => (
								<SoundLink key={sound.phonemeId} sound={sound} />
							))}
						</span>
					)}
				</li>
			))}
		</ol>
	);
}

/** The rare spelling's sliver of its sound's spellings, then other words spelled the same way. */
function UnusualSpellingRow({ spelling }: { spelling: UnusualSpelling }) {
	const { sound, percentage, shares, others } = spelling;
	const share = formatPercentage(percentage);
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-3 text-sm">
				<span className="w-10 shrink-0 font-display text-base font-semibold text-foreground">
					{spelling.spelling}
				</span>
				<ShareBar segments={shares} label={shareBarLabel(spelling)} />
				<span className="shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">
					{share} of <SoundLink sound={sound} />
				</span>
			</div>
			{others.length > 0 ? (
				<ul className="ml-13 flex flex-wrap self-start overflow-hidden rounded-xl bg-background-strong shadow-xs">
					{others.map(({ word, spelled }) => (
						<li key={word}>
							<PlayableWordCell
								targetAccent={ACCENT}
								word={word}
								className="h-full px-3 py-1.5 text-foreground"
							>
								<SpelledWord spelled={spelled} markClassName={MARK} />
							</PlayableWordCell>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

/** "1.0% of /f/ sounds are spelled gh. The common spellings: f 89.0%, ff 7.0%, ph 2.6%." */
function shareBarLabel({ spelling, sound, percentage, shares }: UnusualSpelling): string {
	const common = shares
		.filter((segment) => segment.spelling && !segment.own)
		.map((segment) => `${segment.spelling} ${formatPercentage(segment.percentage)}`)
		.join(", ");
	const own = `${formatPercentage(percentage)} of /${sound.ipa}/ sounds are spelled ${spelling}.`;
	return common ? `${own} The common spellings: ${common}.` : own;
}

/**
 * A sound's spellings side by side, each as wide as its share, this word's one filled in.
 * A rare spelling's sliver can be too thin to see, so a thin marker shows where it is.
 */
function ShareBar({ segments, label }: { segments: readonly ShareSegment[]; label: string }) {
	return (
		<div
			role="img"
			aria-label={label}
			className="flex h-6 min-w-0 flex-1 gap-px overflow-hidden rounded-md"
		>
			{segments.map(({ spelling, percentage, own }) => (
				<span
					key={spelling ?? "rest"}
					style={{ flexGrow: percentage }}
					className={cn(
						"relative flex basis-0 items-center justify-center text-xs",
						own ? "bg-foreground" : spelling ? "bg-secondary text-muted-foreground" : "bg-muted",
					)}
				>
					{own ? (
						<span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-foreground" />
					) : null}
					{spelling && !own && percentage >= LABEL_FROM_PERCENTAGE ? (
						<span className="overflow-hidden">{spelling}</span>
					) : null}
				</span>
			))}
		</div>
	);
}

function Pairs({ word, pairs }: { word: string; pairs: readonly WordPair[] }) {
	const headingId = useId();
	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-3 enter-rise enter-delay-80">
			<h2 id={headingId} className="font-display text-xl font-semibold tracking-tight">
				Minimal pairs
			</h2>
			<ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-background-strong shadow-xs">
				{pairs.map(({ contrastId, path, other, sounds: [own, theirs] }) => (
					<li key={`${contrastId}-${other}`} className="flex flex-wrap items-center gap-x-3">
						<PlayableWordCell
							targetAccent={ACCENT}
							word={word}
							className="px-3 py-1.5 text-foreground"
						/>
						<PlayableWordCell
							targetAccent={ACCENT}
							word={other}
							className="px-3 py-1.5 text-foreground"
						/>
						<Link
							href={path}
							className="ml-auto px-3 py-1.5 text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
						>
							/{own.ipa}/ and /{theirs.ipa}/
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
