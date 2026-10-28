import { Link } from "@tanstack/react-router";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { type ContrastOption, listContrastOptions } from "../_lib/minimal-pair-prompt";

const GROUPS = [
	{ category: "consonant", heading: "Consonants" },
	{ category: "vowel", heading: "Vowels" },
] as const;

function ContrastLink({ option }: { option: ContrastOption }) {
	const [first, second] = option.example;
	return (
		<li>
			<Link
				// The visible IPA is hidden from screen readers, so the example pair names the link.
				aria-label={`${first} and ${second}`}
				className="flex h-full flex-col gap-2 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
				search={{ contrast: option.id }}
				to={MinimalPairActivity.path}
			>
				<span aria-hidden="true" className="flex items-center gap-1.5 font-display text-lg">
					{option.sounds.map((sound) => (
						<span className="rounded-md border border-border px-1.5 py-0.5" key={sound.id}>
							{sound.ipa}
						</span>
					))}
				</span>
				<span className="text-muted-foreground text-sm">
					{first}, {second}
				</span>
			</Link>
		</li>
	);
}

export function ContrastPicker() {
	const options = listContrastOptions();

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold font-display text-2xl tracking-tight sm:text-3xl enter-rise">
					{MinimalPairActivity.name}
				</h1>
				<p className="text-pretty text-muted-foreground text-sm enter-rise enter-delay-40">
					{MinimalPairActivity.description}
				</p>
			</div>

			{GROUPS.map(({ category, heading }) => (
				<section className="flex flex-col gap-3 enter-rise enter-delay-80" key={category}>
					<h2 className="font-display font-semibold">{heading}</h2>
					<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{options
							.filter((option) => option.category === category)
							.map((option) => (
								<ContrastLink key={option.id} option={option} />
							))}
					</ul>
				</section>
			))}
		</div>
	);
}
