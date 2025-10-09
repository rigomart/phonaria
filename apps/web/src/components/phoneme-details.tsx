import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, useContext } from "react";
import type {
	ConsonantAllophone,
	ConsonantPhoneme,
	ExampleWord,
	IpaPhoneme,
	VowelAllophone,
	VowelPhoneme,
} from "shared-data";
import { phonixUtils } from "shared-data";
import { AudioControls } from "@/components/audio-button";
import { Badge } from "@/components/ui/badge";
import { getMinimalPairSets } from "@/data/contrasts";
import { Link } from "@/i18n/navigation";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;
const minimalPairSets = getMinimalPairSets();

const PhonemeDetailsContext = createContext<IpaPhoneme | null>(null);

function usePhonemeDetails() {
	const ctx = useContext(PhonemeDetailsContext);
	if (!ctx) throw new Error("PhonemeDetails* must be used within PhonemeDetails");
	return ctx;
}

function PhonemeDetails({ phoneme, children }: { phoneme: IpaPhoneme; children: React.ReactNode }) {
	return (
		<PhonemeDetailsContext.Provider value={phoneme}>{children}</PhonemeDetailsContext.Provider>
	);
}

function PhonemeDetailsHeader() {
	const phoneme = usePhonemeDetails();
	return (
		<div className="flex items-center justify-between">
			<div className="space-y-1">
				<div className="flex items-center gap-1 font-bold">
					<span className="text-3xl text-muted-foreground/50">/</span>
					<span className="text-4xl leading-none tracking-tight">{phoneme.symbol}</span>
					<span className="text-3xl text-muted-foreground/50">/</span>
				</div>
				<p className="text-xs text-muted-foreground max-w-prose">{phoneme.description}</p>
			</div>
			{phoneme.audioUrl ? (
				<AudioControls src={phoneme.audioUrl} label={`Play ${phoneme.symbol}`} variant="extended" />
			) : null}
		</div>
	);
}

function PhonemeDetailsSagittalView() {
	const t = useTranslations("IpaChart.Dialog");
	return (
		<section className="space-y-3">
			<h3 className="text-sm font-medium">{t("sagittalTitle")}</h3>
			<div className="flex justify-center">
				<div
					className="aspect-square w-full max-w-[28rem] sm:max-w-[30rem] md:max-w-[32rem] rounded-lg border bg-muted/30 text-muted-foreground flex items-center justify-center select-none"
					role="img"
					aria-label={t("sagittalAriaLabel")}
				>
					<span className="text-sm">{t("sagittalPlaceholder")}</span>
				</div>
			</div>
		</section>
	);
}

function ConsonantArticulation() {
	const phoneme = usePhonemeDetails() as ConsonantPhoneme;
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

function VowelArticulation() {
	const phoneme = usePhonemeDetails() as VowelPhoneme;
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

function PhonemeDetailsArticulation() {
	const phoneme = usePhonemeDetails();
	return phoneme.category === "consonant" ? <ConsonantArticulation /> : <VowelArticulation />;
}

function PhonemeDetailsGuide() {
	const phoneme = usePhonemeDetails();
	return phoneme.guide ? (
		<section className="space-y-2">
			<h3 className="text-sm font-medium">How to Make It</h3>
			<p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
				{phoneme.guide}
			</p>
		</section>
	) : null;
}

function PhonemeDetailsExamples() {
	const phoneme = usePhonemeDetails();
	return (
		<section className="space-y-4">
			<h3 className="text-sm font-medium">Examples</h3>
			<ul className="grid gap-3 sm:grid-cols-2">
				{phoneme.examples.map((ex) => (
					<li
						key={ex.word}
						className="flex items-center justify-between gap-4 rounded-md border p-3"
					>
						<div>
							<div className="font-medium">{ex.word}</div>
							<div className="text-muted-foreground text-sm">{toPhonemic(ex.phonemic)}</div>
						</div>
						<AudioControls src={getExampleAudioUrl(ex.word)} label={`Play ${ex.word}`} />
					</li>
				))}
			</ul>
		</section>
	);
}

type Allophone = ConsonantAllophone | VowelAllophone;

function PhonemeDetailsAllophones() {
	const phoneme = usePhonemeDetails();
	const list = (phoneme.allophones || []) as Allophone[];
	if (!list.length) return null;
	return (
		<section className="space-y-4">
			<h3 className="text-sm font-medium">Allophones</h3>
			<ul className="space-y-4">
				{list.map((allo) => (
					<li key={allo.variant} className="rounded-md border p-4 space-y-3 bg-muted/10">
						<div className="flex flex-wrap items-baseline gap-2">
							<span className="font-medium text-base">{allo.variant}</span>
							<span className="text-sm text-muted-foreground">{allo.description}</span>
						</div>
						{"context" in allo && allo.context ? (
							<div className="text-xs text-muted-foreground">Context: {allo.context as string}</div>
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
										<AudioControls src={getExampleAudioUrl(ex.word)} label={`Play ${ex.word}`} />
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

function PhonemeDetailsContrasts() {
	const phoneme = usePhonemeDetails();
	const matchingSets = minimalPairSets.filter((set) => set.focusPhonemes.includes(phoneme.symbol));
	if (!matchingSets.length) return null;

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-medium">Differentiate with…</h3>
			<p className="text-xs text-muted-foreground">
				Launch a listening session that contrasts{" "}
				<span className="font-semibold text-foreground">/{phoneme.symbol}/</span> with nearby
				sounds.
			</p>
			<ul className="grid gap-3">
				{matchingSets.slice(0, 3).map((set) => {
					const partnerSymbol =
						set.focusPhonemes.find((symbol) => symbol !== phoneme.symbol) ?? set.focusPhonemes[0];
					const samplePair = set.pairs[0];
					return (
						<li
							key={set.id}
							className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm font-semibold">
									/{phoneme.symbol}/ vs /{partnerSymbol}/
								</div>
								<Badge variant="outline" className="text-[10px] uppercase tracking-wide">
									{set.category}
								</Badge>
							</div>
							<p className="mt-1 text-xs leading-relaxed text-muted-foreground">{set.summary}</p>
							{samplePair ? (
								<div className="mt-3 rounded-md border border-muted-foreground/30 bg-background/60 px-3 py-2 text-xs font-medium text-foreground">
									{samplePair.words[0].word} · {samplePair.words[1].word}
								</div>
							) : null}
							<Link
								href={{ pathname: "/contrasts", query: { contrast: set.slug } }}
								className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
							>
								Open listening session
								<ArrowRight className="h-3 w-3" />
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

export {
	PhonemeDetails,
	PhonemeDetailsHeader,
	PhonemeDetailsSagittalView,
	PhonemeDetailsArticulation,
	PhonemeDetailsGuide,
	PhonemeDetailsExamples,
	PhonemeDetailsAllophones,
	PhonemeDetailsContrasts,
};
