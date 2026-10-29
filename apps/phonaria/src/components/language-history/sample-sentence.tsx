import { type Ref, useState } from "react";
import { SAMPLE_MEANING, SAMPLES } from "@/lib/language-history/story";
import type { Sample, Source } from "@/lib/language-history/types";
import { cn } from "@/lib/utils";
import { SourceLink } from "./stop-details";

function SampleText({ sample }: { sample: Sample }) {
	return (
		<>
			<blockquote lang={sample.lang} className="font-serif text-base leading-snug italic">
				{sample.text}
			</blockquote>
			{sample.note && <p className="mt-1 text-xs text-muted-foreground">{sample.note}</p>}
		</>
	);
}

const SENTENCE =
	"font-serif text-xl leading-snug text-foreground italic text-shadow-halo md:text-3xl";

function CaptionText({ sample }: { sample: Sample }) {
	const { gloss } = sample;
	return (
		<>
			<figcaption className="text-xs font-semibold tracking-widest text-map-route uppercase text-shadow-halo">
				{sample.stage}, {sample.written}
			</figcaption>
			{gloss ? (
				<blockquote className="mt-1.5">
					<p lang={sample.lang} className="sr-only">
						{sample.text}
					</p>
					<p className="sr-only">In today's words: {gloss.join(" ")}</p>
					<span
						aria-hidden
						className="flex flex-wrap justify-center gap-x-2.5 gap-y-1.5 md:gap-x-3.5"
					>
						{sample.text.split(" ").map((word, index) => (
							<span key={`${word}-${index}`} className="inline-flex flex-col items-center">
								<span lang={sample.lang} className={SENTENCE}>
									{word}
								</span>
								<span className="text-xs leading-tight text-map-route text-shadow-halo md:text-sm">
									{gloss[index]}
								</span>
							</span>
						))}
					</span>
				</blockquote>
			) : (
				<blockquote lang={sample.lang} className={cn("mt-1", SENTENCE)}>
					{sample.text}
				</blockquote>
			)}
		</>
	);
}

const captionPlace = (cardSide: "left" | "right") =>
	cn(
		"pointer-events-none absolute inset-x-3 top-24 z-20 mx-auto flex max-w-2xl flex-col items-center text-center md:top-32",
		cardSide === "right"
			? "md:right-[calc(20rem+3rem)] md:left-6 xl:right-[calc(24rem+3rem)]"
			: "md:right-6 md:left-[calc(20rem+3rem)] xl:left-[calc(24rem+3rem)]",
	);

/**
 * The step's sample sentence. Renders an invisible copy that the camera measures, plus a visible
 * copy that swaps to the new sentence only once `shown` is true.
 */
export function SampleCaption({
	sample,
	shown,
	cardSide,
	sizerRef,
}: {
	sample: Sample | undefined;
	/** The step has been revealed. */
	shown: boolean;
	cardSide: "left" | "right";
	sizerRef: Ref<HTMLElement>;
}) {
	const [displayed, setDisplayed] = useState({ sample, cardSide });
	if (shown && (displayed.sample !== sample || displayed.cardSide !== cardSide)) {
		setDisplayed({ sample, cardSide });
	}
	const visible = shown && sample !== undefined;
	return (
		<>
			<figure ref={sizerRef} aria-hidden className={cn(captionPlace(cardSide), "invisible")}>
				{sample && <CaptionText sample={sample} />}
			</figure>
			<figure
				data-sample-caption={displayed.sample?.id ?? ""}
				aria-hidden={!visible || undefined}
				className={cn(
					captionPlace(displayed.cardSide),
					"transition-opacity motion-reduce:transition-none",
					visible ? "opacity-100 duration-300 ease-out" : "opacity-0 duration-150 ease-in",
				)}
			>
				{displayed.sample && <CaptionText sample={displayed.sample} />}
			</figure>
		</>
	);
}

export function SampleComparison({ sources }: { sources: ReadonlyMap<string, Source> }) {
	return (
		<section
			aria-labelledby="language-history-sample"
			className="relative z-10 border-t bg-background"
		>
			<div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
				<h2 id="language-history-sample" className="font-display text-lg font-semibold">
					One sentence through 1,000 years
				</h2>
				<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
					The first line of the Lord's Prayer, a Christian prayer. It means: “{SAMPLE_MEANING}”
				</p>
				<ol className="mt-6 flex flex-col">
					{SAMPLES.map((sample, index) => (
						<li
							key={sample.id}
							className={cn(
								"grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6",
								index > 0 && "border-t",
							)}
						>
							<div>
								<p className="text-sm font-semibold">{sample.stage}</p>
								<p className="text-xs text-muted-foreground">{sample.written}</p>
							</div>
							<div>
								<SampleText sample={sample} />
								{sample.sources && (
									<ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
										{sample.sources
											.flatMap((id) => sources.get(id) ?? [])
											.map((source) => (
												<li key={source.id}>
													<SourceLink source={source} />
												</li>
											))}
									</ul>
								)}
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
