import {
	type EnglishPhonemeSymbolId,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
} from "@phonaria/phonetics-data";
import { useId } from "react";
import { Link } from "@/components/link";
import { SpelledWord } from "@/components/spelled-word";
import { enterDelay, stagger } from "@/lib/motion";
import {
	getSoundKeyExample,
	SOUNDS_PAGE_HEADING,
	soundHeading,
	soundPagePath,
} from "@/lib/sound-pages";

const GROUPS = [
	{ title: "Consonants", sounds: getLanguagePhonemeIds("en-us", "consonants"), start: 80 },
	{ title: "Vowels", sounds: getLanguagePhonemeIds("en-us", "vowels"), start: 160 },
] as const;

const CARD_STEP = 8;

export function SoundsContent() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background">
			<div className="w-full max-w-4xl space-y-8 p-4 sm:p-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display enter-rise">
						{SOUNDS_PAGE_HEADING}
					</h1>
					<p className="text-sm text-muted-foreground enter-rise enter-delay-40">
						Pick a sound to see how it's made, how it's spelled, and words to practice it with.
					</p>
				</div>
				{GROUPS.map((group) => (
					<SoundGroup key={group.title} {...group} />
				))}
			</div>
		</div>
	);
}

function SoundGroup({
	title,
	sounds,
	start,
}: {
	title: string;
	sounds: readonly EnglishPhonemeSymbolId[];
	start: number;
}) {
	const titleId = useId();
	return (
		<section aria-labelledby={titleId} className="flex flex-col gap-3">
			<h2
				id={titleId}
				className="font-display text-lg font-semibold tracking-tight enter-rise"
				style={enterDelay(start)}
			>
				{title}
			</h2>
			<ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
				{sounds.map((phonemeId, index) => (
					<li
						key={phonemeId}
						className="enter-scale"
						style={enterDelay(stagger(index, { start: start + 20, step: CARD_STEP }))}
					>
						<SoundLink phonemeId={phonemeId} />
					</li>
				))}
			</ul>
		</section>
	);
}

function SoundLink({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const ipa = getIpaForPhonemeId(phonemeId);
	const example = getSoundKeyExample(phonemeId);
	const name = soundHeading(phonemeId);
	return (
		<Link
			href={soundPagePath(phonemeId)}
			aria-label={`${name}, as in ${example.word}`}
			className="flex flex-col gap-1 rounded-xl bg-card px-3 py-2.5 text-card-foreground ring-1 ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
		>
			<span className="font-display text-2xl leading-none">{ipa}</span>
			<span className="text-sm text-muted-foreground">
				as in <SpelledWord spelled={example.spelled} />
			</span>
		</Link>
	);
}
