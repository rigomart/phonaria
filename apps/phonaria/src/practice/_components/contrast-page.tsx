/**
 * One contrast's page: its two sounds and how they differ, speaking practice
 * on its words where `FLAG_SPEECH` is on, every pair in the catalog with its
 * recordings, and links to each sound's page and to the other contrasts with
 * either sound, which all show in every build.
 */
import { buttonVariants } from "@phonaria/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link as AppLink } from "@/components/link";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { flags } from "@/lib/flags";
import { type ContrastPage, type ContrastPageSound, contrastPagePath } from "@/lib/minimal-pairs";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { cn } from "@/lib/utils";
import { MinimalPairPractice } from "./minimal-pair-practice";

function PairTable({ page }: { page: ContrastPage }) {
	const [a, b] = page.sounds;
	return (
		<table className="w-full table-fixed border-separate border-spacing-x-2 border-spacing-y-1.5">
			<caption className="sr-only">
				Minimal pairs for /{a.ipa}/ and /{b.ipa}/
			</caption>
			<thead>
				<tr>
					{page.sounds.map((sound) => (
						<th className="px-1 pb-1 text-left font-normal" key={sound.id} scope="col">
							<AppLink
								className="block w-fit rounded-sm font-display text-xl underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
								href={sound.path}
							>
								/{sound.ipa}/
							</AppLink>
							<span className="block truncate text-muted-foreground text-xs">{sound.label}</span>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{page.pairs.map(([first, second]) => (
					<tr key={`${first}-${second}`}>
						<td>
							<PlayableWordCell
								className="w-full justify-center rounded-lg bg-background-strong px-2 py-1.5 text-foreground shadow-xs"
								targetAccent="en-us"
								word={first}
							/>
						</td>
						<td>
							<PlayableWordCell
								className="w-full justify-center rounded-lg border border-border px-2 py-1.5"
								targetAccent="en-us"
								word={second}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

function OtherContrasts({ sound }: { sound: ContrastPageSound }) {
	const headingId = `contrast-more-${sound.id}`;
	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-3">
			<h2 className="font-display font-semibold" id={headingId}>
				More contrasts with /{sound.ipa}/
			</h2>
			<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
				{sound.otherContrasts.map(({ id, ipas: [a, b], example: [first, second] }) => (
					<li key={id}>
						<AppLink
							className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
							href={contrastPagePath(id)}
						>
							<span className="shrink-0 font-display text-lg">
								/{a}/ vs /{b}/
							</span>
							<span className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
								{first}, {second}
							</span>
							<ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
						</AppLink>
					</li>
				))}
			</ul>
		</section>
	);
}

export function ContrastPageView({ page, word }: { page: ContrastPage; word?: string }) {
	const [a, b] = page.sounds;
	const practice = flags.isEnabled("speech");
	const others = page.sounds.filter((sound) => sound.otherContrasts.length > 0);
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-6">
			<header className="flex flex-col items-start gap-3">
				<Link
					className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "-ml-2.5")}
					to={MinimalPairActivity.path}
				>
					<ArrowLeft aria-hidden="true" />
					All pairs
				</Link>
				<h1 className="font-bold font-display text-3xl tracking-tight sm:text-4xl enter-rise">
					/{a.ipa}/ vs /{b.ipa}/
				</h1>
				<p className="max-w-xl text-pretty text-muted-foreground text-sm enter-rise enter-delay-40">
					{page.difference}
				</p>
			</header>

			{practice ? <MinimalPairPractice contrast={page.id} word={word} /> : null}

			<section
				aria-labelledby="contrast-pairs"
				className="flex flex-col gap-3 enter-rise enter-delay-80"
			>
				<div className="flex flex-col gap-1">
					<h2 className="font-display font-semibold" id="contrast-pairs">
						Minimal pairs
					</h2>
					<p className="text-muted-foreground text-sm">
						{page.pairs.length} pairs of words that differ only by /{a.ipa}/ and /{b.ipa}/. Tap a
						word to hear it.
					</p>
				</div>
				<div className="-mx-2">
					<PairTable page={page} />
				</div>
				{practice ? null : <SyntheticVoiceNote targetAccent="en-us" words={page.pairs.flat()} />}
			</section>

			{others.length > 0 ? (
				<div className="grid gap-8 sm:grid-cols-2 sm:items-start sm:gap-6 enter-rise enter-delay-80">
					{others.map((sound) => (
						<OtherContrasts key={sound.id} sound={sound} />
					))}
				</div>
			) : null}
		</div>
	);
}
