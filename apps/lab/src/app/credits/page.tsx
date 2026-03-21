import { Badge } from "@phonaria/ui/components/badge";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
	title: "Credits & Sources - Phonaria Lab",
	description: "Credits and sources for Phonaria resources, data, and media.",
	robots: { index: false, follow: true },
};

type CreditCardProps = {
	title: string;
	content: string;
	link?: { text: string; url: string };
	license?: { text: string; url: string };
};

function CreditCard({ title, content, link, license }: CreditCardProps) {
	return (
		<div className="flex flex-col rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 overflow-hidden h-full">
			<div className="p-4">
				<h2 className="text-base font-semibold tracking-tight font-display">{title}</h2>
				<p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{content}</p>
			</div>

			{(link || license) && (
				<div className="mt-auto border-t border-border/50 bg-muted/30 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
					{link && (
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
						>
							{link.text}
							<ExternalLink className="size-3.5" />
						</a>
					)}
					{license && (
						<a
							href={license.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
						>
							<Badge variant="outline" className="font-normal">
								{license.text}
							</Badge>
						</a>
					)}
				</div>
			)}
		</div>
	);
}

const CREDITS: (CreditCardProps & { key: string })[] = [
	{
		key: "cmu",
		title: "CMU Pronouncing Dictionary",
		content:
			"Transcription uses the CMU Pronouncing Dictionary from Carnegie Mellon University. The dictionary contains over 134,000 North American English words with phonetic transcriptions and is released under a BSD license.",
		link: { text: "View CMUdict on GitHub", url: "https://github.com/cmusphinx/cmudict" },
		license: {
			text: "BSD",
			url: "https://github.com/cmusphinx/cmudict/blob/master/LICENSE",
		},
	},
	{
		key: "phoneme-audio",
		title: "Phoneme Audio Samples",
		content:
			"Phoneme audio samples come from the General phonetics gallery on Wikimedia Commons. Recordings were created by Wikimedia contributors including Dvortygirl, Peter Isotalo, Denelson83, and Erutuon, and are used under Creative Commons Attribution-ShareAlike and compatible licenses. See individual file pages for authorship and license details.",
		link: {
			text: "View General phonetics gallery",
			url: "https://commons.wikimedia.org/wiki/General_phonetics",
		},
		license: {
			text: "CC BY-SA 3.0+",
			url: "https://creativecommons.org/licenses/by-sa/3.0/",
		},
	},
	{
		key: "wordfreq",
		title: "wordfreq Word Frequency Data",
		content:
			"Curated word lists for client-side lookup are generated using wordfreq by Robyn Speer. The library combines frequency data from Google Books Ngrams, OpenSubtitles, SUBTLEX, Wikipedia, and other corpora.",
		link: { text: "View wordfreq on GitHub", url: "https://github.com/rspeer/wordfreq" },
		license: {
			text: "CC BY-SA 4.0",
			url: "https://creativecommons.org/licenses/by-sa/4.0/",
		},
	},
	{
		key: "phonetic-data",
		title: "Phonetic Data",
		content:
			"Articulatory descriptions, phoneme features, and IPA classifications draw from standard phonetic references and linguistics research.",
	},
];

export default function CreditsPage() {
	return (
		<div className="flex flex-1 flex-col bg-background">
			<a
				href="/"
				className="group absolute top-3 left-4 z-10 flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
				aria-label="Phonaria Lab"
			>
				<Logo className="size-6" />
				<span className="font-display text-sm font-medium opacity-0 blur-[4px] transition-[opacity,filter] duration-200 group-hover:opacity-100 group-hover:blur-[0px]">
					Phonaria
				</span>
			</a>

			<div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6 pt-14">
				<div className="flex flex-col gap-1">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
						Credits & Sources
					</h1>
					<p className="text-sm text-muted-foreground">
						Phonaria uses open source projects, linguistic research, and freely licensed resources.
					</p>
				</div>

				<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{CREDITS.map((credit) => (
						<CreditCard
							key={credit.key}
							title={credit.title}
							content={credit.content}
							link={credit.link}
							license={credit.license}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
