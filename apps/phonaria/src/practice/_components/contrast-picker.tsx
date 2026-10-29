import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PlayableWord } from "@/components/phoneme-details/playable-word";
import { SyntheticVoiceNote } from "@/components/synthetic-voice-note";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { type ContrastOption, listContrastOptions } from "../_lib/minimal-pair-prompt";

const GROUPS = [
	{ category: "consonant", heading: "Consonants" },
	{ category: "vowel", heading: "Vowels" },
] as const;

/** The example words sit above the row's stretched link, so tapping one plays it instead of opening the pair. */
function ContrastRow({ option }: { option: ContrastOption }) {
	const [first, second] = option.example;
	const [a, b] = option.sounds;
	return (
		<li className="relative flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted motion-reduce:transition-none">
			<span aria-hidden="true" className="w-20 shrink-0 font-display text-xl">
				{a.ipa} <span className="text-muted-foreground">·</span> {b.ipa}
			</span>
			<span className="flex min-w-0 flex-1 items-center gap-3 text-muted-foreground text-sm">
				<span className="relative z-10">
					<PlayableWord targetAccent="en-us" word={first} />
				</span>
				<span className="relative z-10">
					<PlayableWord targetAccent="en-us" word={second} />
				</span>
			</span>
			<Link
				// The visible IPA is hidden from screen readers, so the example pair names the link.
				aria-label={`${first} and ${second}`}
				className="flex items-center text-muted-foreground after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
				search={{ contrast: option.id }}
				to={MinimalPairActivity.path}
			>
				<ChevronRight aria-hidden="true" className="size-4" />
			</Link>
		</li>
	);
}

export function ContrastPicker() {
	const options = listContrastOptions();

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold font-display text-2xl tracking-tight sm:text-3xl enter-rise">
					{MinimalPairActivity.name}
				</h1>
				<p className="max-w-xl text-pretty text-muted-foreground text-sm enter-rise enter-delay-40">
					{MinimalPairActivity.description} Tap a word to hear it first.
				</p>
			</div>

			<div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-6">
				{GROUPS.map(({ category, heading }) => (
					<section className="flex flex-col gap-3 enter-rise enter-delay-80" key={category}>
						<h2 className="font-display font-semibold">{heading}</h2>
						<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
							{options
								.filter((option) => option.category === category)
								.map((option) => (
									<ContrastRow key={option.id} option={option} />
								))}
						</ul>
					</section>
				))}
			</div>

			<SyntheticVoiceNote
				targetAccent="en-us"
				words={options.flatMap((option) => option.example)}
			/>
		</div>
	);
}
