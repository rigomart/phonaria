import type { ConsonantPhoneme, ExampleWord, IpaPhoneme, VowelPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio/audio-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

interface PhonemeDialogProps {
	phoneme: IpaPhoneme | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Unified dialog for consonant & vowel phonemes.
 * Streamlines duplicated layout, examples, and allophones sections.
 */
export function PhonemeDialog({ phoneme, open, onOpenChange }: PhonemeDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				{phoneme ? <PhonemeDialogBody phoneme={phoneme} /> : null}
			</DialogContent>
		</Dialog>
	);
}

function PhonemeDialogBody({ phoneme }: { phoneme: IpaPhoneme }) {
	const isConsonant = phoneme.category === "consonant";

	const tags: string[] = isConsonant
		? [
				(phoneme as ConsonantPhoneme).articulation.voicing,
				(phoneme as ConsonantPhoneme).articulation.place,
				(phoneme as ConsonantPhoneme).articulation.manner,
			]
		: [
				(phoneme as VowelPhoneme).articulation.height,
				(phoneme as VowelPhoneme).articulation.frontness,
				(phoneme as VowelPhoneme).articulation.roundness,
				(phoneme as VowelPhoneme).articulation.tenseness,
				...((phoneme as VowelPhoneme).articulation.rhoticity
					? [(phoneme as VowelPhoneme).articulation.rhoticity as string]
					: []),
			];

	return (
		<div className="space-y-8">
			<HeaderSection phoneme={phoneme} tags={tags} />
			<ArticulationSection phoneme={phoneme} />
			{phoneme.guide ? <GuideSection guide={phoneme.guide} /> : null}
			<ExamplesSection examples={phoneme.examples} />
			{phoneme.allophones?.length ? <AllophonesSection allophones={phoneme.allophones} /> : null}
		</div>
	);
}

function HeaderSection({ phoneme, tags }: { phoneme: IpaPhoneme; tags: string[] }) {
	return (
		<DialogHeader className="space-y-4 p-0">
			<DialogTitle className="flex items-center gap-2">
				<span className="text-5xl text-muted-foreground">/</span>
				<span className="text-6xl font-semibold leading-none tracking-tight">{phoneme.symbol}</span>
				<span className="text-5xl text-muted-foreground">/</span>
			</DialogTitle>
			<div className="flex flex-wrap gap-2">
				{tags.map((t) => (
					<span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
						{t.replace("near-", "near ")}
					</span>
				))}
			</div>
			<p className="text-sm text-muted-foreground max-w-prose">{phoneme.description}</p>
		</DialogHeader>
	);
}

function ArticulationSection({ phoneme }: { phoneme: IpaPhoneme }) {
	if (phoneme.category === "consonant") {
		const c = phoneme as ConsonantPhoneme;
		return (
			<section className="text-sm">
				<h3 className="mb-1 font-medium">Articulation</h3>
				<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
					<li>
						Voicing: <span className="capitalize text-foreground">{c.articulation.voicing}</span>
					</li>
					<li>
						Place: <span className="capitalize text-foreground">{c.articulation.place}</span>
					</li>
					<li>
						Manner: <span className="capitalize text-foreground">{c.articulation.manner}</span>
					</li>
				</ul>
			</section>
		);
	}
	const v = phoneme as VowelPhoneme;
	return (
		<section className="text-sm">
			<h3 className="mb-1 font-medium">Articulation</h3>
			<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
				<li>
					Height: <span className="capitalize text-foreground">{v.articulation.height}</span>
				</li>
				<li>
					Frontness: <span className="capitalize text-foreground">{v.articulation.frontness}</span>
				</li>
				<li>
					Lip rounding:{" "}
					<span className="capitalize text-foreground">{v.articulation.roundness}</span>
				</li>
				<li>
					Tenseness: <span className="capitalize text-foreground">{v.articulation.tenseness}</span>
				</li>
				{v.articulation.rhoticity ? (
					<li>
						Rhoticity:{" "}
						<span className="capitalize text-foreground">{v.articulation.rhoticity}</span>
					</li>
				) : null}
			</ul>
		</section>
	);
}

function GuideSection({ guide }: { guide: string }) {
	return (
		<section className="space-y-2">
			<h3 className="text-sm font-medium">How to Make It</h3>
			<p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{guide}</p>
		</section>
	);
}

function ExamplesSection({ examples }: { examples: ExampleWord[] }) {
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

interface AnyAllophone {
	variant: string;
	description: string;
	examples: ExampleWord[];
	context?: string;
}

function AllophonesSection({ allophones }: { allophones: AnyAllophone[] }) {
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
								{allo.examples.map((ex) => (
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
