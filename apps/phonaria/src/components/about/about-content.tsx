import { ArrowDown, ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "@/components/link";
import { getTools } from "@/components/site-nav";
import type { AppFlags } from "@/lib/flags";
import { IPA_CHART_VOWELS_PATH } from "@/lib/ipa-chart-metadata";
import { contrastPagePath } from "@/lib/minimal-pairs";
import { cn } from "@/lib/utils";
import {
	cardClass,
	EXAMPLE_BOARD,
	IxSound,
	PickIpa,
	PickNarrow,
	PickPeak,
	SoundChips,
	Sources,
	StageBadge,
	ToolLink,
} from "./parts";

/** Prototype for #264. One variant ships; the switcher goes with the others. */
export const ABOUT_VARIANTS = [
	{ id: "a", label: "A · Fewer words" },
	{ id: "b", label: "B · Listen first" },
	{ id: "c", label: "C · Tools first" },
] as const;

export type AboutVariant = (typeof ABOUT_VARIANTS)[number]["id"];

export function AboutContent({ variant, flags }: { variant: AboutVariant; flags: AppFlags }) {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-4xl space-y-10 p-4 sm:p-6">
				<VariantSwitcher current={variant} />
				{variant === "a" && <VariantA />}
				{variant === "b" && <VariantB flags={flags} />}
				{variant === "c" && <VariantC flags={flags} />}
			</div>
		</div>
	);
}

function VariantSwitcher({ current }: { current: AboutVariant }) {
	return (
		<nav
			aria-label="Prototype variants"
			className="flex flex-wrap items-center gap-1 rounded-lg bg-secondary p-1 text-sm"
		>
			{ABOUT_VARIANTS.map((v) => (
				<Link
					key={v.id}
					href={`/about?variant=${v.id}`}
					aria-current={v.id === current ? "page" : undefined}
					className={cn(
						"rounded-md px-3 py-1.5 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						v.id === current && "bg-card font-medium text-foreground",
					)}
				>
					{v.label}
				</Link>
			))}
		</nav>
	);
}

function PageTitle({ children }: { children: ReactNode }) {
	return <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{children}</h1>;
}

function SectionTitle({ children }: { children: ReactNode }) {
	return <h2 className="font-display text-lg font-semibold tracking-tight">{children}</h2>;
}

/* ------------------------------------------------------------------------ */
/* A · Fewer words: the kept Trace layout, with captions instead of prose.  */
/* ------------------------------------------------------------------------ */

function VariantA() {
	return (
		<>
			<header className="space-y-3">
				<PageTitle>About Phonaria</PageTitle>
				<p className="max-w-2xl text-muted-foreground">
					Phonaria is a free set of tools for American English pronunciation. Transcription shows
					the sounds in any English text. The IPA Chart shows how to say each sound.
				</p>
			</header>

			<section className="space-y-4">
				<div className="space-y-1">
					<SectionTitle>How a sound improves</SectionTitle>
					<p className="text-sm text-muted-foreground">One word, three stages.</p>
				</div>
				<StageRow
					stages={[
						{
							name: "Starting point",
							example: <PickPeak />,
							text: (
								<>
									<em>pick</em> sounds like <em>peak</em>.
								</>
							),
							check: "Play both. Do they sound the same to you?",
						},
						{
							name: "Clear",
							badge: "Goal",
							example: <PickIpa />,
							text: (
								<>
									<em>pick</em> and <em>peak</em> sound different. People understand you.
								</>
							),
							check: "You hear the difference. You say it too.",
						},
						{
							name: "Native-like",
							badge: "Optional",
							example: <PickNarrow />,
							text: "A small puff of air comes after the p.",
							check: "Hold your hand near your mouth. Say pick. Do you feel air?",
						},
					]}
				/>
			</section>

			<div className="grid gap-6 md:grid-cols-2">
				<section className="space-y-3">
					<SectionTitle>Each sound has its own stage</SectionTitle>
					<p className="text-sm text-muted-foreground">One learner, for example:</p>
					<Board />
				</section>
				<section className="space-y-3">
					<SectionTitle>How to improve a sound</SectionTitle>
					<div className={cn(cardClass, "space-y-2")}>
						<p className="font-medium">1. Find the sound.</p>
						<p className="text-sm text-muted-foreground">
							Spelling does not show it. Type the word.
						</p>
						<ToolLink href="/">Transcription</ToolLink>
					</div>
					<div className={cn(cardClass, "space-y-3")}>
						<p className="font-medium">2. Learn to say it.</p>
						<IxSound />
						<ToolLink href={IPA_CHART_VOWELS_PATH}>IPA Chart</ToolLink>
					</div>
				</section>
			</div>
			<Sources />
		</>
	);
}

type Stage = {
	name: string;
	badge?: string;
	example: ReactNode;
	text: ReactNode;
	check: string;
};

function StageRow({ stages }: { stages: Stage[] }) {
	return (
		<ol className="flex flex-col gap-2 md:flex-row md:items-stretch">
			{stages.map((stage, index) => (
				<li key={stage.name} className="flex flex-col items-center gap-2 md:flex-1 md:flex-row">
					{index > 0 && (
						<>
							<ArrowDown aria-hidden="true" className="size-4 text-muted-foreground md:hidden" />
							<ArrowRight
								aria-hidden="true"
								className="hidden size-4 shrink-0 text-muted-foreground md:block"
							/>
						</>
					)}
					<div className={cn(cardClass, "flex w-full flex-1 flex-col gap-3 self-stretch")}>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">{index + 1}</span>
							<h3 className="font-semibold">{stage.name}</h3>
							{stage.badge && <StageBadge>{stage.badge}</StageBadge>}
						</div>
						<div className="flex min-h-12 items-center">{stage.example}</div>
						<p>{stage.text}</p>
						<p className="mt-auto border-t pt-3 text-sm text-muted-foreground">
							<span className="font-medium text-foreground">Check: </span>
							{stage.check}
						</p>
					</div>
				</li>
			))}
		</ol>
	);
}

function Board({ names = ["Starting point", "Clear", "Native-like"] }: { names?: string[] }) {
	return (
		<div className={cn(cardClass, "space-y-3")}>
			{EXAMPLE_BOARD.map((sounds, index) => (
				<div key={names[index]} className="space-y-1.5">
					<p className="text-sm text-muted-foreground">{names[index]}</p>
					<SoundChips sounds={sounds} />
				</div>
			))}
		</div>
	);
}

/* ------------------------------------------------------------------------ */
/* B · Listen first: opens with the learner's own ear, then the stages as   */
/* what a listener hears. Mentions minimal pairs, since Phonaria can listen. */
/* ------------------------------------------------------------------------ */

function VariantB({ flags }: { flags: AppFlags }) {
	const [answer, setAnswer] = useState<"same" | "different" | null>(null);
	const answerClass =
		"rounded-lg px-3 py-2 text-sm ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
	return (
		<>
			<section className={cn(cardClass, "space-y-4 p-6")}>
				<PageTitle>Play these two words.</PageTitle>
				<PickPeak />
				<p className="text-lg">Do they sound different to you?</p>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						aria-pressed={answer === "same"}
						onClick={() => setAnswer("same")}
						className={cn(
							answerClass,
							answer === "same" ? "bg-primary text-primary-foreground" : "bg-background",
						)}
					>
						They sound the same
					</button>
					<button
						type="button"
						aria-pressed={answer === "different"}
						onClick={() => setAnswer("different")}
						className={cn(
							answerClass,
							answer === "different" ? "bg-primary text-primary-foreground" : "bg-background",
						)}
					>
						They sound different
					</button>
				</div>
				{answer === "same" && (
					<p className="max-w-2xl">
						That is normal. Many languages have one sound here. English has two: /ɪ/ in{" "}
						<em>pick</em> and /i/ in <em>peak</em>. You can learn to hear both.
					</p>
				)}
				{answer === "different" && (
					<p className="max-w-2xl">
						Good. You hear the two sounds. Next, you say them differently, so other people hear the
						right word.
					</p>
				)}
			</section>

			<section className="space-y-4">
				<SectionTitle>What a listener hears</SectionTitle>
				<p className="max-w-2xl text-muted-foreground">
					You say <em>pick</em>. Here are three things a listener can hear.
				</p>
				<ol className="grid gap-3 md:grid-cols-3">
					<ListenerStage
						index={1}
						title={
							<>
								They hear <em>peak</em>
							</>
						}
						example={<PickPeak />}
						text="Your sound and the English sound are different. The listener hears another word."
					/>
					<ListenerStage
						index={2}
						title={
							<>
								They hear <em>pick</em>
							</>
						}
						badge="Goal"
						example={<PickIpa />}
						text="The listener understands you. You may still have an accent. That is fine."
					/>
					<ListenerStage
						index={3}
						title="They hear a native speaker"
						badge="Optional"
						example={<PickNarrow />}
						text="You also add small details, like the puff of air after the p."
					/>
				</ol>
			</section>

			<section className="space-y-3">
				<SectionTitle>Your sounds are not all at the same stage</SectionTitle>
				<p className="max-w-2xl text-muted-foreground">
					Some of your sounds are already clear. Some are not yet. Here is one learner. Select a
					sound to see how to say it.
				</p>
				<Board
					names={[
						"They hear another word",
						"They hear the right word",
						"They hear a native speaker",
					]}
				/>
			</section>

			<section className="space-y-3">
				<SectionTitle>How Phonaria helps with one sound</SectionTitle>
				<div className="grid gap-3 md:grid-cols-3">
					<HelpCard
						step="Which sound is in this word?"
						text="Type any word. Transcription shows its sounds."
					>
						<ToolLink href="/">Transcription</ToolLink>
					</HelpCard>
					<HelpCard step="How do I say this sound?" text="Listen to the sound. See the mouth.">
						<IxSound />
						<ToolLink href={IPA_CHART_VOWELS_PATH}>IPA Chart</ToolLink>
					</HelpCard>
					{flags.speech && (
						<HelpCard
							step="Did I say it right?"
							text="Say pick or peak. Phonaria tells you which word it heard."
						>
							<ToolLink href={contrastPagePath("i-ix")}>Minimal pairs</ToolLink>
						</HelpCard>
					)}
				</div>
			</section>

			<section className="space-y-2 border-t pt-6">
				<SectionTitle>About Phonaria</SectionTitle>
				<p className="max-w-2xl text-sm text-muted-foreground">
					Phonaria is a free set of tools for American English pronunciation. You can start with any
					tool. There is no course to follow.
				</p>
				<Sources />
			</section>
		</>
	);
}

function ListenerStage({
	index,
	title,
	badge,
	example,
	text,
}: {
	index: number;
	title: ReactNode;
	badge?: string;
	example: ReactNode;
	text: string;
}) {
	return (
		<li className={cn(cardClass, "flex flex-col gap-3")}>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">{index}</span>
				{badge && <StageBadge>{badge}</StageBadge>}
			</div>
			<h3 className="font-display text-lg font-semibold">{title}</h3>
			<div className="flex min-h-12 items-center">{example}</div>
			<p className="text-sm text-muted-foreground">{text}</p>
		</li>
	);
}

function HelpCard({ step, text, children }: { step: string; text: string; children: ReactNode }) {
	return (
		<div className={cn(cardClass, "flex flex-col gap-3")}>
			<p className="font-medium">{step}</p>
			<p className="text-sm text-muted-foreground">{text}</p>
			<div className="mt-auto space-y-3">{children}</div>
		</div>
	);
}

/* ------------------------------------------------------------------------ */
/* C · Tools first: a conventional About page. What Phonaria is and each    */
/* tool lead; the stages are a short strip lower down.                      */
/* ------------------------------------------------------------------------ */

const TOOL_LINES: Record<string, string> = {
	transcription: "Type English text. See the sounds of every word, with stress marked.",
	"ipa-chart": "Every American English sound, with a recording and a drawing of the mouth.",
	"minimal-pairs":
		"Pairs like ship and sheep. Say one, and Phonaria tells you which word it heard.",
	practice: "Build the sounds of a word. Then compare your answer with the dictionary.",
	"language-history": "The story of English, from its oldest roots to today, on a globe.",
};

function VariantC({ flags }: { flags: AppFlags }) {
	return (
		<>
			<header className="space-y-3">
				<PageTitle>About Phonaria</PageTitle>
				<p className="max-w-2xl text-lg">
					Phonaria is a free set of tools for American English pronunciation.
				</p>
				<p className="max-w-2xl text-muted-foreground">
					Each tool works alone. You can start with any of them. The explanations use plain words
					next to the phonetic symbols.
				</p>
			</header>

			<section className="space-y-3">
				<SectionTitle>The tools</SectionTitle>
				<ul className="grid gap-3 sm:grid-cols-2">
					{getTools(flags).map((tool) => (
						<li key={tool.id}>
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
									<span className="block text-sm text-muted-foreground">{TOOL_LINES[tool.id]}</span>
								</span>
							</Link>
						</li>
					))}
				</ul>
			</section>

			<section className="space-y-3">
				<SectionTitle>How pronunciation improves</SectionTitle>
				<p className="max-w-2xl text-muted-foreground">
					Pronunciation improves one sound at a time. Each sound goes through three stages. Here is
					the vowel in <em>pick</em>.
				</p>
				<div className={cn(cardClass, "grid gap-4 md:grid-cols-3 md:divide-x")}>
					<StripStep name="Starting point" example={<PickPeak />}>
						<em>pick</em> sounds like <em>peak</em>.
					</StripStep>
					<StripStep name="Clear" badge="Goal" example={<PickIpa size="text-2xl" />}>
						Listeners hear <em>pick</em>.
					</StripStep>
					<StripStep name="Native-like" badge="Optional" example={<PickNarrow size="text-2xl" />}>
						A small puff of air after the p.
					</StripStep>
				</div>
				<p className="max-w-2xl text-sm text-muted-foreground">
					Clear is the goal: people understand you, even with an accent. Most of your sounds can be
					clear while a few are still at the starting point.
				</p>
				<Sources />
			</section>

			<section className="space-y-2 border-t pt-6 text-sm text-muted-foreground">
				<p>
					Phonaria is open source. The data and recordings it uses are listed on the{" "}
					<Link href="/credits" className="text-primary underline-offset-4 hover:underline">
						Credits
					</Link>{" "}
					page.
				</p>
			</section>
		</>
	);
}

function StripStep({
	name,
	badge,
	example,
	children,
}: {
	name: string;
	badge?: string;
	example: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2 md:px-4 md:first:pl-0 md:last:pr-0">
			<div className="flex items-center gap-2">
				<h3 className="font-semibold">{name}</h3>
				{badge && <StageBadge>{badge}</StageBadge>}
			</div>
			<div className="flex min-h-12 items-center">{example}</div>
			<p className="text-sm">{children}</p>
		</div>
	);
}
