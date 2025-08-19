import type {
	ConsonantAllophone,
	ConsonantPhoneme,
	ExampleWord,
	IpaPhoneme,
	VowelAllophone,
	VowelPhoneme,
} from "shared-data";
import { phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio/audio-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

// --- Compound Component Definitions ---

const Root = Dialog;
const Content = DialogContent;

function Header({ phoneme }: { phoneme: IpaPhoneme }) {
	return (
		<DialogHeader className="space-y-4 p-0">
			<DialogTitle className="flex items-center gap-2">
				<span className="text-5xl text-muted-foreground">/</span>
				<span className="text-6xl font-semibold leading-none tracking-tight">{phoneme.symbol}</span>
				<span className="text-5xl text-muted-foreground">/</span>
			</DialogTitle>
			<p className="text-sm text-muted-foreground max-w-prose">{phoneme.description}</p>
		</DialogHeader>
	);
}

function ConsonantArticulation({ phoneme }: { phoneme: ConsonantPhoneme }) {
	const properties: { label: string; value: string }[] = [
		{ label: "Voicing", value: phoneme.articulation.voicing },
		{ label: "Place", value: phoneme.articulation.place },
		{ label: "Manner", value: phoneme.articulation.manner },
	];

	return (
		<section className="text-sm">
			<h3 className="mb-1 font-medium">Articulation</h3>
			<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
				{properties.map(({ label, value }) => (
					<li key={label}>
						{label}: <span className="capitalize text-foreground">{value}</span>
					</li>
				))}
			</ul>
		</section>
	);
}

function VowelArticulation({ phoneme }: { phoneme: VowelPhoneme }) {
	const properties: { label: string; value: string }[] = [
		{ label: "Height", value: phoneme.articulation.height },
		{ label: "Frontness", value: phoneme.articulation.frontness },
		{ label: "Lip rounding", value: phoneme.articulation.roundness },
		{ label: "Tenseness", value: phoneme.articulation.tenseness },
	];

	if (phoneme.articulation.rhoticity) {
		properties.push({ label: "Rhoticity", value: phoneme.articulation.rhoticity });
	}

	return (
		<section className="text-sm">
			<h3 className="mb-1 font-medium">Articulation</h3>
			<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
				{properties.map(({ label, value }) => (
					<li key={label}>
						{label}: <span className="capitalize text-foreground">{value}</span>
					</li>
				))}
			</ul>
		</section>
	);
}

function Guide({ guide }: { guide: string }) {
	return (
		<section className="space-y-2">
			<h3 className="text-sm font-medium">How to Make It</h3>
			<p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{guide}</p>
		</section>
	);
}

function Examples({ examples }: { examples: ExampleWord[] }) {
	return (
		<section className="space-y-4">
			<h3 className="text-sm font-medium">Examples</h3>
			<ul className="grid gap-3 sm:grid-cols-2">
				{examples.map((ex) => (
					<li
						key={ex.word}
						className="flex items-center justify-between gap-4 rounded-md border p-3"
					>
						<div>
							<div className="font-medium">{ex.word}</div>
							<div className="text-muted-foreground text-sm">{toPhonemic(ex.phonemic)}</div>
						</div>
						<AudioButton src={getExampleAudioUrl(ex.word)} label={`Play ${ex.word}`} />
					</li>
				))}
			</ul>
		</section>
	);
}

// Properly typed allophone union
type Allophone = ConsonantAllophone | VowelAllophone;

function Allophones({ allophones }: { allophones: Allophone[] }) {
	return (
		<section className="space-y-4">
			<h3 className="text-sm font-medium">Allophones</h3>
			<ul className="space-y-4">
				{allophones.map((allo) => (
					<li key={allo.variant} className="rounded-md border p-4 space-y-3 bg-muted/10">
						<div className="flex flex-wrap items-baseline gap-2">
							<span className="font-medium text-base">{allo.variant}</span>
							<span className="text-sm text-muted-foreground">{allo.description}</span>
						</div>
						{allo.context ? (
							<div className="text-xs text-muted-foreground">Context: {allo.context}</div>
						) : null}
						{allo.examples?.length ? (
							<ul className="space-y-2">
								{allo.examples.map((ex: ExampleWord) => (
									<li
										key={ex.word}
										className="flex items-center justify-between gap-3 rounded-md border p-2"
									>
										<div>
											<div className="text-sm">{ex.word}</div>
											<div className="text-xs text-muted-foreground">{toPhonemic(ex.phonemic)}</div>
										</div>
										<AudioButton src={getExampleAudioUrl(ex.word)} label={`Play ${ex.word}`} />
									</li>
								))}
							</ul>
						) : null}
					</li>
				))}
			</ul>
		</section>
	);
}

// --- Assemble and Export Compound Component ---

export const PhonemeDialog = {
	Root,
	Content,
	Header,
	ConsonantArticulation,
	VowelArticulation,
	Guide,
	Examples,
	Allophones,
};
