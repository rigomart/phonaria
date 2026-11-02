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
	notes: { heading: "Differences" | "Keep in mind"; items: readonly string[] };
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
			])} use its pronunciations too.`,
			notes: {
				heading: "Differences",
				items: [
					"The dictionary writes sounds in its own code. That code is turned into IPA symbols here, so some symbols differ from other dictionaries.",
					"The dictionary uses one code for the vowel written here as /ʌ/ in stressed syllables and /ə/ in unstressed ones.",
					"The vowel with an r sound is written /ɝ/ in every syllable, stressed or not, and never /ɚ/.",
					"The r sound is written /ɹ/.",
					"The dictionary has no syllable breaks, so they're added by rule. A break can differ from another dictionary's.",
					"For some words listed with both /ɑ/ and /ɔ/, such as caught and talk, the /ɔ/ pronunciation is the one shown first.",
					"Words the dictionary lacks aren't guessed. They show as letters with no sounds, and you may get a spelling suggestion.",
				],
			},
		},
		{
			key: "wiktionary",
			title: "Wiktionary",
			by: "Wiktionary contributors, hosted by the Wikimedia Foundation",
			licenses: [{ text: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" }],
			links: [{ text: "Wiktionary", url: "https://en.wiktionary.org/" }],
			uses: "After you transcribe, the word box shows definitions fetched from Wiktionary when you open it.",
			notes: {
				heading: "Differences",
				items: [
					"Only the English entries are shown, as short excerpts.",
					"Each part of speech gets at most 2 meanings, with no more than 6 in all.",
					"An example sentence comes with a meaning when there is one.",
					"Images, tables and references are left out, and the text is plain.",
					"The full entry is on Wiktionary.",
				],
			},
		},
		{
			key: "jev",
			title: "Jev",
			by: "TypeSafe, through OpenRouter",
			links: [{ text: "Jev documentation", url: "https://docs.typesafe.ai/api" }],
			uses: "Jev is an AI model. When a word you type isn't in the dictionary, it picks the real word you most likely meant from similar spellings, if one fits your sentence.",
			notes: {
				heading: "Keep in mind",
				items: [
					"Jev gets the text around the unknown word (up to 300 characters), the word itself and the similar real words it could be.",
					"If Jev is unsure, you get no suggestion.",
					"If Jev is unavailable, a built-in rule takes over. It favors common words and may also suggest nothing.",
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
			uses: "Each sound's card and page play a recording from the General phonetics gallery.",
			notes: {
				heading: "Keep in mind",
				items: [
					"The recordings show each IPA symbol as speech experts say it, not as an American says the English sound.",
					"So some vowels can sound different from the way Americans say them.",
					"Diphthongs have no recording yet.",
					"Each recording's author and license are on its page on Wikimedia Commons.",
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
			uses: `You can play these words ${listPhrase([
				"on sound cards and sound pages",
				"in the minimal-pair lists",
				"in the word box",
				...(practice ? ["when you practise"] : []),
			])}.`,
			notes: {
				heading: "Keep in mind",
				items: [
					"It's a computer voice, not a person.",
					"Each recording follows a pronunciation chosen in advance, and each was checked before upload.",
					"Some words have one recording for each meaning or form, such as read (present) and read (past).",
					"The voice doesn't always match the symbols shown. It says words with /ɔ/, such as caught, with the /ɑ/ of father.",
					"Where the page shows /ɝ/ in an unstressed syllable, the voice says /ɚ/.",
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
			uses: "When you practise saying a minimal pair, your recording goes to Azure AI Speech, which reports the sounds it heard. Rules in this app, not Azure, then decide, for each sound, whether it matched, was swapped for another sound, or was unclear.",
			notes: {
				heading: "Keep in mind",
				items: [
					"Your recording goes to Azure for the check and isn't kept after.",
					"The checks come from a speech recognizer, so a verdict can be wrong.",
					`"${EvidenceLogNotice.label}" is off unless you turn it on.`,
					`When it's on: ${EvidenceLogNotice.description}`,
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
			uses: `Its counts of how often words are used pick the 1,000 and 10,000 most common words, which transcription loads first. They also pick ${listPhrase(
				[
					"the common words on each sound page",
					...(enabled.soundSearch ? ["the words you can find by their sounds"] : []),
				],
			)}, and set each sound's share of speech on the Frequency page.`,
			notes: {
				heading: "Keep in mind",
				items: [
					"The data reflects language up to about 2021. Its author has stopped updating it.",
					"The shares on the Frequency page are estimates, not measured from recorded speech.",
					"Each share counts the sounds in the 10,000 most common words, with each word weighted by how often it's used.",
					"A word with more than one pronunciation counts only its first one.",
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
			uses: "The consonant table and vowel chart take their symbols, sound labels and layout from it.",
			notes: {
				heading: "Differences",
				items: [
					"Only the sounds of American English are shown, and empty rows and columns are left out.",
					"/tʃ/ and /dʒ/ get their own row, and /w/ its own column. The official chart lists these outside its main table.",
					"/ɹ/ sits one column further back than on the official chart.",
					"The vowel chart is Phonaria's own drawing.",
					"It adds /ɝ/, which the official chart doesn't have.",
					"Each diphthong is an arrow from where it starts to where it ends.",
					"Each vowel sits at the official chart's spot for its symbol, not where Americans say it.",
					"American /aɪ/, for example, often starts further back than the chart shows.",
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
			uses: "Sound cards and sound pages show these diagrams for consonants, with two each for /tʃ/ and /dʒ/, one for each part of the sound. Vowels use Phonaria's own charts instead.",
			notes: {
				heading: "Differences",
				items: [
					"The original drawing was changed, and there's a version for each consonant.",
					"Phonaria's versions are shared under the same license, CC BY-SA 4.0.",
				],
			},
		},
		{
			key: "phonetic-data",
			title: "Phonaria's sound notes",
			by: "Phonaria",
			links: [],
			uses: "These cover how each sound is made, its variants and its spelling patterns. They also include the minimal-pair lists and the notes on vowels many Americans say alike.",
			notes: {
				heading: "Keep in mind",
				items: [
					"They're written and checked by hand, so they may contain mistakes.",
					"The minimal pairs were checked against the 10,000 most common words.",
					"The notes on vowels many Americans say alike draw on the Atlas of North American English (Labov, Ash and Boberg, 2006) and US dictionaries such as Merriam-Webster.",
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
			uses: "The History page lists its own sources. Each pin names the works behind it, and the main works are at the end of the page. The globe's land comes from Natural Earth.",
			notes: {
				heading: "Keep in mind",
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
					<dt className="font-medium">Used for</dt>
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
						Phonaria's pronunciations, recordings, charts and word lists come from the sources
						below. Phonaria is in beta, so these sources and how they're used can change.
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
