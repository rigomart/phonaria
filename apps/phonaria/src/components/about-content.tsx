import {
	type EnglishPhonemeSymbolId,
	getIpaForPhonemeId,
	type LanguagePhonemeId,
} from "@phonaria/phonetics-data";
import { Badge } from "@phonaria/ui/components/badge";
import { ArrowRight, AudioLines, Ear, Grid3x3, type LucideIcon, Shapes } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/components/link";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { PhonemeDetailsButton } from "@/components/transcription/display/clickable-phoneme";
import { IPA_CHART_CONSONANTS_PATH } from "@/lib/ipa-chart-metadata";
import { contrastPagePath } from "@/lib/minimal-pairs";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { SOUNDS_PATH, soundPagePath } from "@/lib/sound-pages";
import { cn } from "@/lib/utils";

const cardClass = "rounded-xl bg-card p-4 text-card-foreground ring-1 ring-border";
const linkClass =
	"rounded-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Tool = { href: string; label: string; icon: LucideIcon; text: string };

/** Production-live tools only: Practice, History and speaking practice are flagged off there (#264). */
const TOOLS: readonly Tool[] = [
	{
		href: "/",
		label: "Transcription",
		icon: AudioLines,
		text: "Type English words or sentences. See the sounds of each word, and which part of the word to say more strongly.",
	},
	{
		href: IPA_CHART_CONSONANTS_PATH,
		label: "IPA Chart",
		icon: Grid3x3,
		text: "All the sounds of American English in one chart, with their IPA symbols. Play each sound and see how to say it.",
	},
	{
		href: SOUNDS_PATH,
		label: "Sounds",
		icon: Shapes,
		text: "A page for each sound: how to say it, how it is spelled, and words that use it.",
	},
	{
		href: MinimalPairActivity.path,
		label: "Minimal pairs",
		icon: Ear,
		text: "Pairs of words that differ by one sound, like ship and sheep. Play both and listen for the difference.",
	},
];

const EXAMPLE_BOARD: readonly { stage: string; sounds: readonly EnglishPhonemeSymbolId[] }[] = [
	{ stage: "Starting point", sounds: ["IX", "TH", "DH", "V"] },
	{ stage: "Clear", sounds: ["P", "K", "I", "S", "T", "AE"] },
	{ stage: "Native-like", sounds: ["M", "N"] },
];

export function AboutContent() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-4xl space-y-10 p-4 sm:p-6">
				<header className="space-y-3">
					<h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl enter-rise">
						About Phonaria
					</h1>
					<p className="max-w-2xl text-lg enter-rise enter-delay-40">
						Phonaria is a free set of tools for American English pronunciation.
					</p>
					<p className="max-w-2xl text-muted-foreground enter-rise enter-delay-40">
						Each tool works on its own, so you can start with any of them. The explanations use
						plain words next to IPA symbols. IPA is an alphabet with one symbol for each sound.
					</p>
				</header>

				<section className="space-y-3 enter-rise enter-delay-80">
					<SectionTitle>The tools</SectionTitle>
					<ul data-about="tools" className="grid gap-3 sm:grid-cols-2">
						{TOOLS.map((tool) => (
							<li key={tool.href}>
								<Link
									href={tool.href}
									className={cn(
										cardClass,
										"flex h-full gap-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
									)}
								>
									<tool.icon
										aria-hidden="true"
										className="mt-0.5 size-5 shrink-0 text-muted-foreground"
									/>
									<span className="space-y-1">
										<span className="block font-medium">{tool.label}</span>
										<span className="block text-sm text-muted-foreground">{tool.text}</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>

				<section className="space-y-4">
					<SectionTitle>How pronunciation improves</SectionTitle>
					<p className="max-w-2xl text-muted-foreground">
						Pronunciation improves one sound at a time. Each sound goes through three stages. Here
						is the vowel sound in <em>pick</em> at each stage.
					</p>
					<ol className={cn(cardClass, "grid gap-4 md:grid-cols-3 md:divide-x")}>
						<Stage
							name="Starting point"
							example={<PickPeak />}
							link={{ href: contrastPagePath("i-ix"), text: "Hear more pairs like this" }}
						>
							<em>pick</em> sounds like <em>peak</em>. Listeners can hear the wrong word.
						</Stage>
						<Stage
							name="Clear"
							badge="Goal"
							example={<PickIpa />}
							link={{ href: soundPagePath("IX"), text: "How to say /ɪ/" }}
						>
							Listeners hear <em>pick</em>. You can still have an accent.
						</Stage>
						<Stage name="Native-like" badge="Optional" example={<PickNarrow />}>
							You also add small details. In <em>pick</em>, a small puff of air comes after the{" "}
							<em>p</em>.
						</Stage>
					</ol>
					<div className="grid gap-4 md:grid-cols-2 md:items-start">
						<div className="space-y-2 text-muted-foreground">
							<p>
								Clear is the goal. At that stage, people understand you. Native-like is optional.
							</p>
							<p>
								Your sounds are not all at the same stage. Some are already clear, and some are not.
								Here is one learner as an example. Select a sound to see how to say it.
							</p>
						</div>
						<div data-about="board" className={cn(cardClass, "space-y-3")}>
							{EXAMPLE_BOARD.map(({ stage, sounds }) => (
								<div key={stage} className="space-y-1.5">
									<p className="text-sm text-muted-foreground">{stage}</p>
									<div className="flex flex-wrap gap-1.5">
										{sounds.map((id) => (
											<SoundButton
												key={id}
												phonemeId={id}
												className="min-w-10 bg-background text-center text-xl ring-1 ring-border"
											/>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						Sources: Munro &amp; Derwing (1995), on accent and being understood; Levis (2005), on
						clear speech as the goal.
					</p>
				</section>

				<p className="border-t pt-6 text-sm text-muted-foreground">
					The sources of the data and recordings are listed on the{" "}
					<Link href="/credits" className={linkClass}>
						Credits
					</Link>{" "}
					page.
				</p>
			</div>
		</div>
	);
}

function SectionTitle({ children }: { children: ReactNode }) {
	return <h2 className="font-display text-lg font-semibold tracking-tight">{children}</h2>;
}

function Stage({
	name,
	badge,
	example,
	link,
	children,
}: {
	name: string;
	badge?: string;
	example: ReactNode;
	link?: { href: string; text: string };
	children: ReactNode;
}) {
	return (
		<li className="flex flex-col gap-2 md:px-4 md:first:pl-0 md:last:pr-0">
			<div className="flex items-center gap-2">
				<h3 className="font-semibold">{name}</h3>
				{badge && <Badge variant="secondary">{badge}</Badge>}
			</div>
			<div className="flex min-h-12 items-center">{example}</div>
			<p className="text-sm">{children}</p>
			{link && (
				<Link
					href={link.href}
					className={cn(linkClass, "mt-auto inline-flex items-center gap-1 self-start text-sm")}
				>
					{link.text}
					<ArrowRight aria-hidden="true" className="size-3.5" />
				</Link>
			)}
		</li>
	);
}

function SoundButton({
	phonemeId,
	className,
}: {
	phonemeId: LanguagePhonemeId<"en-us">;
	className?: string;
}) {
	return (
		<PhonemeDetailsButton
			targetAccent="en-us"
			phonemeId={phonemeId}
			symbol={getIpaForPhonemeId(phonemeId)}
			className={cn("font-display", className)}
		/>
	);
}

function PickPeak() {
	return (
		<div className="flex gap-2">
			{["pick", "peak"].map((word) => (
				<PlayableWordCell
					key={word}
					targetAccent="en-us"
					word={word}
					className="rounded-lg bg-background px-3 py-2 text-base text-foreground"
				/>
			))}
		</div>
	);
}

function PickIpa() {
	return (
		<span className="inline-flex items-center font-display text-2xl">
			<span className="text-muted-foreground">/</span>
			{(["P", "IX", "K"] as const).map((id) => (
				<SoundButton key={id} phonemeId={id} className="px-0.5" />
			))}
			<span className="text-muted-foreground">/</span>
		</span>
	);
}

function PickNarrow() {
	return (
		<span className="font-display text-2xl">
			<span className="text-muted-foreground">[</span>pʰɪk
			<span className="text-muted-foreground">]</span>
		</span>
	);
}
