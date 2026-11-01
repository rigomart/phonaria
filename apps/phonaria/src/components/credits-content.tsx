import { Badge } from "@phonaria/ui/components/badge";
import { ExternalLink } from "lucide-react";
import type { AppFlags } from "@/lib/flags";
import { enterDelay, stagger } from "@/lib/motion";
import { EvidenceLogNotice } from "@/lib/speech/evidence-log";

/** The flags that decide which sources, and which uses of a source, the page mentions. */
export type CreditsFlags = Pick<
	AppFlags,
	"practice" | "speech" | "soundSearch" | "languageHistory"
>;

type Href = { text: string; url: string };

type Credit = {
	/** Also the section's `id`. Other surfaces link to `/credits#<key>`, so keys stay stable. */
	key: string;
	title: string;
	by: string;
	licenses?: readonly Href[];
	links: readonly Href[];
	uses: string;
	notes: { heading: "How Phonaria differs" | "What to keep in mind"; items: readonly string[] };
};

function listPhrase(items: readonly string[]): string {
	if (items.length <= 1) return items.join("");
	return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Every source the page lists, in order. A source only flagged features use is left out
 * while those flags are off, and so is a flagged use of a shared source, so with every
 * flag off the page reads as if those features don't exist.
 */
export function buildCredits(enabled: CreditsFlags): Credit[] {
	const practice = enabled.practice || enabled.speech;

	const credits: (Credit | false)[] = [
		{
			key: "cmu",
			title: "CMU Pronouncing Dictionary",
			by: "Carnegie Mellon University",
			licenses: [
				{ text: "BSD-style", url: "https://github.com/cmusphinx/cmudict/blob/master/LICENSE" },
			],
			links: [{ text: "CMUdict on GitHub", url: "https://github.com/cmusphinx/cmudict" }],
			uses: `Transcription looks up each word in a copy of this dictionary. ${listPhrase([
				"The minimal pairs",
				"the common words on sound pages",
				...(enabled.practice ? ["the Practice words"] : []),
				...(enabled.soundSearch ? ["the words you can find by their sounds"] : []),
			])} also use its pronunciations.`,
			notes: {
				heading: "How Phonaria differs",
				items: [
					"The dictionary writes sounds in ARPAbet, and Phonaria converts them to IPA with its own mapping. Unstressed AH becomes /ə/ and stressed AH becomes /ʌ/. Every ER becomes /ɝ/, even unstressed, rather than /ɚ/. R becomes /ɹ/.",
					"The dictionary has no syllable breaks. Phonaria adds them by rule, so a split can differ from the one in another dictionary.",
					"For some words listed with both /ɑ/ and /ɔ/, such as caught and talk, Phonaria shows the /ɔ/ form first.",
					"Phonaria doesn't guess words the dictionary lacks. It shows their letters with no sounds and may suggest a spelling.",
				],
			},
		},
		{
			key: "wiktionary",
			title: "Wiktionary",
			by: "Wiktionary contributors, hosted by the Wikimedia Foundation",
			licenses: [{ text: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" }],
			links: [{ text: "Wiktionary", url: "https://en.wiktionary.org/" }],
			uses: "Definitions in the word box after you transcribe. Phonaria fetches them from Wiktionary when you open the box.",
			notes: {
				heading: "How Phonaria differs",
				items: [
					"Phonaria shows short excerpts of the English entries only: at most 2 meanings for each part of speech and 6 in all, with an example sentence when there is one.",
					"Images, tables and references are removed, and the text is shown plain. Wiktionary has the full entry.",
				],
			},
		},
		{
			key: "jev",
			title: "Jev",
			by: "TypeSafe, through OpenRouter",
			links: [{ text: "Jev documentation", url: "https://docs.typesafe.ai/api" }],
			uses: "When a word you type isn't in the dictionary, Jev picks the close spelling that fits your sentence, if one does.",
			notes: {
				heading: "What to keep in mind",
				items: [
					"Phonaria sends Jev the text around the unknown word (up to 300 characters), the unknown word and the close spellings it could be.",
					"If Jev is unsure, Phonaria suggests nothing. If Jev is unavailable, Phonaria uses its own rule, which favors common words and may also suggest nothing.",
				],
			},
		},
		{
			key: "phoneme-audio",
			title: "Sound recordings",
			by: "Wikimedia Commons contributors, including Dvortygirl, Peter Isotalo, Denelson83 and Erutuon",
			licenses: [{ text: "CC BY-SA 3.0+", url: "https://creativecommons.org/licenses/by-sa/3.0/" }],
			links: [
				{
					text: "General phonetics gallery",
					url: "https://commons.wikimedia.org/wiki/General_phonetics",
				},
			],
			uses: "The recording of each sound on its card and its page. Each comes from the General phonetics gallery and was converted to Ogg. Authors and licenses for each file are on its Commons page.",
			notes: {
				heading: "What to keep in mind",
				items: [
					"The recordings demonstrate each IPA symbol as phoneticians say it, not an American speaker saying the English sound. Some vowels can sound different from the way Americans say them.",
					"Diphthongs have no recording yet.",
				],
			},
		},
		{
			key: "word-recordings",
			title: "Word recordings",
			by: "Azure AI Speech text-to-speech from Microsoft, voice Jenny (US English)",
			links: [
				{
					text: "Azure text-to-speech",
					url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech",
				},
			],
			uses: `The words you can play ${listPhrase([
				"on sound cards and sound pages",
				"in the minimal-pair lists",
				"in the word box",
				...(practice ? ["when you practise"] : []),
			])}.`,
			notes: {
				heading: "What to keep in mind",
				items: [
					"The voice is synthetic, not a person. Phonaria generated each recording from a set pronunciation and checked it before uploading.",
					"Some words have one recording for each meaning or form, such as read (present) and read (past).",
					"The voice doesn't keep every difference Phonaria shows. It says /ɔ/ words such as caught with the /ɑ/ of father, and unstressed /ɝ/ as /ɚ/.",
				],
			},
		},
		enabled.speech && {
			key: "speech-scoring",
			title: "Speech scoring",
			by: "Azure AI Speech pronunciation assessment and speech recognition from Microsoft",
			links: [
				{
					text: "Azure pronunciation assessment",
					url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment",
				},
			],
			uses: "When you practise saying a minimal pair, your recording goes to Azure AI Speech, which reports the sounds it heard. Phonaria's own rules turn that into a verdict for each sound: a match, a swap with another sound, or unclear.",
			notes: {
				heading: "What to keep in mind",
				items: [
					"Phonaria passes your recording to Azure and doesn't store it.",
					"The checks come from a speech recognizer, not a teacher, so a verdict can be wrong.",
					`"${EvidenceLogNotice.label}" is off unless you turn it on. With it on, ${EvidenceLogNotice.description}`,
				],
			},
		},
		{
			key: "wordfreq",
			title: "wordfreq",
			by: "Robyn Speer",
			licenses: [
				{ text: "Data: CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
				{ text: "Code: Apache 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" },
			],
			links: [{ text: "wordfreq on GitHub", url: "https://github.com/rspeer/wordfreq" }],
			uses: `Word frequencies, which pick ${listPhrase([
				"the 1,000 and 10,000 most common words that transcription loads first",
				"the common words on each sound page",
				...(enabled.soundSearch ? ["the words you can find by their sounds"] : []),
				"each sound's share of speech on the Frequency page",
			])}.`,
			notes: {
				heading: "What to keep in mind",
				items: [
					"The data is a snapshot of language up to about 2021, and its author has stopped updating it.",
					"The shares on the Frequency page are estimates. Phonaria counts the sounds in the dictionary pronunciations of the 10,000 most common words (first form only), weighted by how often each word is used. They aren't measured from recorded speech.",
				],
			},
		},
		{
			key: "ipa-chart",
			title: "IPA chart",
			by: "International Phonetic Association",
			licenses: [{ text: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" }],
			links: [
				{
					text: "The IPA chart",
					url: "https://www.internationalphoneticassociation.org/content/ipa-chart",
				},
			],
			uses: "The symbols, sound labels and the layout of the consonant table and vowel chart.",
			notes: {
				heading: "How Phonaria differs",
				items: [
					"Phonaria shows only the sounds of American English and leaves out empty rows and columns.",
					"It adds an affricate row for /tʃ/ and /dʒ/ and a labial-velar column for /w/, which the official chart lists outside its main table.",
					"It lists /ɹ/ as postalveolar. The official chart lists it as alveolar.",
					"Phonaria draws its own vowel chart. It adds /ɝ/, which the official chart doesn't have, and draws each diphthong as an arrow from where it starts to where it ends.",
					"Each vowel sits where the IPA places its symbol, not where American speakers say it. American /aɪ/, for example, often starts further back than the chart shows.",
				],
			},
		},
		{
			key: "diagrams",
			title: "Mouth diagrams",
			by: "Adapted from an illustration by Tavin and Nardog on Wikimedia Commons",
			licenses: [{ text: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" }],
			links: [
				{
					text: "Original illustration",
					url: "https://commons.wikimedia.org/wiki/File:Voiceless_dental_fricative_articulation.svg",
				},
			],
			uses: "The mouth diagrams for consonants on sound cards and sound pages, with one for each stage of /tʃ/ and /dʒ/. Vowels use Phonaria's own charts instead.",
			notes: {
				heading: "How Phonaria differs",
				items: [
					"Phonaria changed the original drawing and made a version for each consonant.",
					"The adapted diagrams are shared under the same license, CC BY-SA 4.0.",
				],
			},
		},
		{
			key: "phonetic-data",
			title: "Phonaria's sound notes",
			by: "Phonaria",
			links: [],
			uses: "How each sound is made, its variants, its spelling patterns, the minimal-pair lists and the notes on vowel mergers.",
			notes: {
				heading: "What to keep in mind",
				items: [
					"These are written and checked by hand for Phonaria, so they may contain mistakes.",
					"The minimal pairs were checked against the 10,000 most common words.",
					"The merger notes draw on the Atlas of North American English (Labov, Ash and Boberg, 2006) and US dictionaries such as Merriam-Webster.",
				],
			},
		},
		enabled.languageHistory && {
			key: "history",
			title: "History page",
			by: "Natural Earth, and the works the page cites",
			licenses: [
				{ text: "Public domain", url: "https://www.naturalearthdata.com/about/terms-of-use/" },
			],
			links: [{ text: "Natural Earth", url: "https://www.naturalearthdata.com/" }],
			uses: "The History page lists its own sources: each pin names the works behind it, and the main works are at the end of the page. Its globe draws land from Natural Earth.",
			notes: {
				heading: "What to keep in mind",
				items: ["The globe's coastlines are simplified, and small islands are left out."],
			},
		},
	];
	return credits.filter((credit): credit is Credit => credit !== false);
}

const externalLinkClass =
	"inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline";

function CreditSection({ credit, index }: { credit: Credit; index: number }) {
	return (
		<section
			id={credit.key}
			aria-labelledby={`${credit.key}-title`}
			className="scroll-mt-16 rounded-xl bg-card p-4 text-card-foreground ring-1 ring-border enter-rise sm:p-5"
			style={enterDelay(stagger(index, { start: 80, step: 30 }))}
		>
			<div className="flex flex-col gap-1">
				<h2
					id={`${credit.key}-title`}
					className="font-display text-base font-semibold tracking-tight"
				>
					{credit.title}
				</h2>
				<p className="text-sm text-muted-foreground">{credit.by}</p>
			</div>

			<dl className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
				<div className="flex flex-col gap-1">
					<dt className="font-medium">What Phonaria uses it for</dt>
					<dd className="text-muted-foreground">{credit.uses}</dd>
				</div>
				<div className="flex flex-col gap-1">
					<dt className="font-medium">{credit.notes.heading}</dt>
					<dd>
						<ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground marker:text-muted-foreground">
							{credit.notes.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</dd>
				</div>
			</dl>

			{credit.links.length > 0 || credit.licenses ? (
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
					{credit.links.map((link) => (
						<a
							key={link.url}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className={externalLinkClass}
						>
							{link.text}
							<ExternalLink aria-hidden="true" className="size-3.5" />
						</a>
					))}
					{credit.licenses?.map((license) => (
						<a
							key={license.text}
							href={license.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`License: ${license.text}`}
						>
							<Badge variant="outline" className="font-normal">
								{license.text}
							</Badge>
						</a>
					))}
				</div>
			) : null}
		</section>
	);
}

/** Framework-neutral Credits page body. Route files stay thin adapters. */
export function CreditsContent({ flags }: { flags: CreditsFlags }) {
	const credits = buildCredits(flags);
	return (
		<div className="flex flex-1 flex-col bg-background">
			<div className="container mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
				<div className="flex flex-col gap-2">
					<h1 className="font-display text-xl font-bold tracking-tight enter-rise sm:text-2xl">
						Credits & Sources
					</h1>
					<p className="text-sm text-muted-foreground enter-rise enter-delay-40">
						Each source below says what Phonaria uses it for and where Phonaria's version differs
						from it. Phonaria is in beta, so these sources and the choices made with them can
						change.
					</p>
				</div>

				<nav aria-label="Sources on this page" className="enter-rise enter-delay-40">
					<ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
						{credits.map((credit) => (
							<li key={credit.key}>
								<a
									href={`#${credit.key}`}
									className="text-primary underline-offset-2 hover:underline"
								>
									{credit.title}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="flex flex-col gap-4">
					{credits.map((credit, index) => (
						<CreditSection key={credit.key} credit={credit} index={index} />
					))}
				</div>
			</div>
		</div>
	);
}
