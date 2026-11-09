import { ArrowUpRight } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "@/components/link";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SpelledWord } from "@/components/spelled-word";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { WordAudioForms } from "@/components/word-audio-forms";
import { buildWiktionaryEntryUrl } from "@/lib/definition/word";
import { formatPercentage } from "@/lib/phoneme-frequency";
import {
	type LetterGroup,
	type UnusualSpelling,
	type WordPageView,
	type WordPair,
	type WordSound,
} from "@/lib/word-page-content";

const ACCENT = "en-us" as const;
const MARK = "underline decoration-2 underline-offset-4";
const SOUND_LINK =
	"rounded-sm font-display text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

/**
 * A word's own page: its IPA and recordings, the letters that spell each of its
 * sounds, the spellings in it that are rare for their sound, and the minimal
 * pairs it is in. Everything comes from the data; nothing is written per word.
 */
export function WordPageContent({ view }: { view: WordPageView }) {
	const titleId = useId();
	return (
		<article
			aria-labelledby={titleId}
			className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-6"
		>
			<header className="flex flex-col items-start gap-3 enter-rise">
				<h1 id={titleId} className="font-bold font-display text-3xl tracking-tight sm:text-4xl">
					{view.name} in IPA: <span className="whitespace-nowrap">/{view.ipa}/</span>
				</h1>
				<p className="text-sm text-muted-foreground">American English</p>
				<WordAudioForms targetAccent={ACCENT} word={view.word} pronunciation={view.pronunciation} />
				<SyntheticVoiceNote targetAccent={ACCENT} words={[view.word]} />
			</header>

			<Section title="Letters and sounds" delay="enter-delay-40">
				<LetterBreakdown letters={view.letters} />
			</Section>

			<Section
				title={view.unusual.length > 1 ? "Unusual spellings" : "An unusual spelling"}
				delay="enter-delay-80"
			>
				<div className="flex flex-col gap-4">
					{view.unusual.map((spelling) => (
						<UnusualSpellingCard
							key={`${spelling.spelling}-${spelling.sound.phonemeId}`}
							spelling={spelling}
						/>
					))}
				</div>
			</Section>

			{view.pairs.length > 0 ? (
				<Section title={`Minimal pairs with ${view.word}`} delay="enter-delay-80">
					<Pairs word={view.word} pairs={view.pairs} />
				</Section>
			) : null}

			<p className="text-sm text-muted-foreground enter-rise enter-delay-80">
				<a
					href={buildWiktionaryEntryUrl(view.word)}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
				>
					What {view.word} means, on Wiktionary
					<ArrowUpRight aria-hidden="true" className="size-3.5" />
				</a>
			</p>
		</article>
	);
}

function Section({
	title,
	delay,
	children,
}: {
	title: string;
	delay: string;
	children: ReactNode;
}) {
	const headingId = useId();
	return (
		<section aria-labelledby={headingId} className={`flex flex-col gap-3 enter-rise ${delay}`}>
			<h2 id={headingId} className="font-display text-xl font-semibold tracking-tight">
				{title}
			</h2>
			{children}
		</section>
	);
}

function SoundLink({ sound }: { sound: WordSound }) {
	return (
		<Link href={sound.path} className={SOUND_LINK}>
			/{sound.ipa}/
		</Link>
	);
}

/** Each group of letters over the sound it spells, in word order. */
function LetterBreakdown({ letters }: { letters: readonly LetterGroup[] }) {
	return (
		<ol
			aria-label="Each group of letters and the sound it spells"
			className="flex flex-wrap gap-1.5"
		>
			{letters.map(({ letters: text, sounds }, index) => (
				<li
					key={`${index}-${text}`}
					className="flex min-w-14 flex-col items-center gap-1 rounded-xl bg-background-strong px-3 py-2 shadow-xs"
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

function UnusualSpellingCard({ spelling }: { spelling: UnusualSpelling }) {
	const { sound, percentage, others } = spelling;
	return (
		<div className="flex flex-col gap-2">
			<p className="text-pretty text-sm text-foreground">
				<span className="font-display font-semibold">{spelling.spelling}</span> spells{" "}
				<SoundLink sound={sound} /> here. Only {formatPercentage(percentage)} of /{sound.ipa}/
				sounds in everyday speech are spelled {spelling.spelling}.
			</p>
			{others.length > 0 ? (
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span className="text-xs text-muted-foreground">Also in</span>
					<ul className="flex flex-wrap overflow-hidden rounded-xl bg-background-strong shadow-xs">
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
				</div>
			) : null}
		</div>
	);
}

function Pairs({ word, pairs }: { word: string; pairs: readonly WordPair[] }) {
	return (
		<ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-background-strong shadow-xs">
			{pairs.map(({ contrastId, path, other, sounds: [own, theirs] }) => (
				<li key={`${contrastId}-${other}`} className="flex flex-wrap items-center gap-x-3">
					<PlayableWordCell
						targetAccent={ACCENT}
						word={word}
						className="px-3 py-1.5 text-foreground"
					/>
					<span className="text-xs text-muted-foreground">vs</span>
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
	);
}
