import { Separator } from "@phonaria/ui/components/separator";
import { ExternalLink } from "lucide-react";

export function AboutPage() {
	return (
		<div className="flex flex-col gap-8 px-4 py-8 animate-fade-in-up">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">About Schwadle</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					A phoneme guessing game for learners of English pronunciation
				</p>
			</div>

			<Section title="How It Works">
				<p>
					Each round shows you an English word. Your job is to build its pronunciation using
					individual phonemes — the distinct sounds that make up spoken English.
				</p>
				<p>
					You can tap phonemes on the IPA keyboard or type in the search field to find them by name,
					symbol, or articulatory features. After 5 rounds, you'll see a breakdown of your answers
					with per-phoneme feedback.
				</p>
			</Section>

			<Separator />

			<Section title="Target Accent">
				<p>
					Schwadle uses <strong>General American (GA)</strong> pronunciation as its reference
					accent. GA is the standard variety taught in most American English courses and used in
					major pronunciation dictionaries.
				</p>
				<p>
					This means words like "bath" use /æ/ (not /ɑː/ as in British RP), "cot" and "caught" may
					share the same vowel, and post-vocalic /ɹ/ is always pronounced ("car" = /kɑɹ/).
				</p>
				<p>
					If you speak a different dialect or accent, your natural pronunciation may differ — that
					doesn't make it wrong, it just means Schwadle is testing GA specifically.
				</p>
			</Section>

			<Separator />

			<Section title="Transcription Source">
				<p>
					All word-to-phoneme data comes from the{" "}
					<ExternalAnchor href="https://github.com/cmusphinx/cmudict">
						CMU Pronouncing Dictionary (CMUDict)
					</ExternalAnchor>
					, a free, open-source pronunciation dictionary maintained by Carnegie Mellon University.
				</p>
				<p>
					CMUDict provides pronunciations in ARPABET notation, which Schwadle maps to IPA symbols
					using a custom phoneme ID system. Words with multiple valid pronunciations (e.g. "either"
					as /iðɚ/ or /aɪðɚ/) are all accepted as correct answers.
				</p>
			</Section>

			<Separator />

			<Section title="Phoneme Inventory">
				<p>
					The game uses the <strong>40 phonemes of General American English</strong>: 24 consonants,
					11 monophthongs (simple vowels), and 5 diphthongs (gliding vowels).
				</p>
				<p>Notable phonemes that trip up learners:</p>
				<ul className="ml-4 list-disc space-y-1">
					<li>
						<strong>Schwa /ə/</strong> — the most common English sound, found in unstressed
						syllables. It's the vowel in the second syllable of "sofa" or the first syllable of
						"about". Spelling gives almost no clues about where schwas appear.
					</li>
					<li>
						<strong>Dental fricatives /θ/ and /ð/</strong> — the "th" sounds in "think" vs. "this".
						Rare across the world's languages, common in English.
					</li>
					<li>
						<strong>/ʒ/</strong> — the sound in "measure" and "vision". Relatively rare in English
						and never appears at the start of native words.
					</li>
					<li>
						<strong>R-colored vowel /ɝ/</strong> — the vowel in "bird" and "nurse", unique to rhotic
						accents like GA.
					</li>
				</ul>
			</Section>

			<Separator />

			<Section title="Difficulty Modes">
				<p>
					<strong>Easy mode</strong> gives you two aids: you can hear each phoneme's pronunciation
					by tapping its key on the keyboard, and the number of syllables is shown as a badge. These
					narrow down the search space considerably.
				</p>
				<p>
					<strong>Hard mode</strong> strips both aids. You see only the written word and must rely
					entirely on your knowledge of English phonology. Silent letters, unexpected vowel
					reductions, and foreign-origin spellings make this genuinely challenging.
				</p>
			</Section>

			<Separator />

			<Section title="Scoring">
				<p>
					Your answer is correct if the phoneme sequence you entered exactly matches any valid
					CMUDict pronunciation for the word. There's no partial credit — it's either right or not.
				</p>
				<p>On the results screen, each phoneme in your answer is color-coded:</p>
				<ul className="ml-4 list-disc space-y-1">
					<li>
						<span className="font-semibold text-green-600 dark:text-green-400">Green</span> —
						correct phoneme in the right position
					</li>
					<li>
						<span className="font-semibold text-red-600 dark:text-red-400">Red</span> — extra
						phoneme that shouldn't be there
					</li>
					<li>
						<span className="text-muted-foreground line-through">Dimmed</span> — a phoneme that was
						expected but missing from your answer
					</li>
				</ul>
			</Section>

			<Separator />

			<Section title="Why 'Schwadle'?">
				<p>
					The name is a mashup of "schwa" (ə) — the trickiest and most common English phoneme — and
					the "-dle" suffix popularized by Wordle and its many spinoffs.
				</p>
				<p>
					The schwa is, fittingly, the boss fight of this game. It hides in unstressed syllables
					with no consistent spelling pattern: the "a" in "about", the "o" in "lemon", the "u" in
					"supply". If you can spot the schwas, you can beat Schwadle.
				</p>
			</Section>

			<Separator />

			<footer className="pb-4 text-center text-xs text-muted-foreground">
				<p>
					Built as part of{" "}
					<ExternalAnchor href="https://github.com/rigos/phonaria">Phonaria</ExternalAnchor>, an
					open-source toolkit for phonetics exploration.
				</p>
			</footer>
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-3">
			<h2 className="text-lg font-semibold">{title}</h2>
			<div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/80">
				{children}
			</div>
		</section>
	);
}

function ExternalAnchor({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex items-center gap-0.5 font-medium text-primary underline underline-offset-2 hover:text-primary/80"
		>
			{children}
			<ExternalLink className="size-3" />
		</a>
	);
}
