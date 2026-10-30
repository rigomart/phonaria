/**
 * One contrast's page: its two sounds and how they differ, speaking practice
 * on its words where `FLAG_SPEECH` is on, and every pair in the catalog with
 * its recordings, which show in every build.
 */
import { buttonVariants } from "@phonaria/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { flags } from "@/lib/flags";
import type { ContrastPage } from "@/lib/minimal-pairs";
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
							<span className="block font-display text-xl">/{sound.ipa}/</span>
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

export function ContrastPageView({ page, word }: { page: ContrastPage; word?: string }) {
	const [a, b] = page.sounds;
	const practice = flags.isEnabled("speech");
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
		</div>
	);
}
