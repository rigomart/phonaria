"use client";

import type {
	ConsonantAllophone,
	ConsonantPhoneme,
	ExampleWord,
	VowelAllophone,
	VowelPhoneme,
} from "shared-data";
import { phonariaUtils } from "shared-data";
import { AudioControls } from "@/components/audio-button";
import { Separator } from "@/components/ui/separator";
import { usePhonemeDetailsContext } from "./index";

const { toPhonemic, getExampleAudioUrl } = phonariaUtils;

export function TabArticulation() {
	const { phoneme } = usePhonemeDetailsContext();

	return (
		<div className="space-y-6 pb-2">
			<section>
				<h4 className="text-sm font-semibold mb-3">Articulatory Properties</h4>
				<div className="space-y-2">
					{phoneme.category === "consonant" ? (
						<ConsonantProperties phoneme={phoneme as ConsonantPhoneme} />
					) : (
						<VowelProperties phoneme={phoneme as VowelPhoneme} />
					)}
				</div>
			</section>

			{phoneme.allophones && phoneme.allophones.length > 0 ? (
				<>
					<Separator />
					<section>
						<h4 className="text-sm font-semibold mb-3">Allophones</h4>
						<div className="space-y-4">
							{phoneme.allophones.map((allophone: ConsonantAllophone | VowelAllophone) => (
								<div key={allophone.variant} className="space-y-2">
									<div className="flex items-baseline gap-2">
										<span className="font-medium text-sm">{allophone.variant}</span>
										<span className="text-xs text-muted-foreground">{allophone.description}</span>
									</div>
									{"context" in allophone && allophone.context ? (
										<p className="text-xs text-muted-foreground">Context: {allophone.context}</p>
									) : null}
									{allophone.examples && allophone.examples.length > 0 ? (
										<div className="space-y-1.5">
											{allophone.examples.slice(0, 2).map((ex: ExampleWord) => (
												<div
													key={ex.word}
													className="flex items-center justify-between gap-2 rounded border bg-card p-2"
												>
													<div>
														<div className="text-xs font-medium">{ex.word}</div>
														<div className="text-[10px] text-muted-foreground">
															{toPhonemic(ex.phonemic)}
														</div>
													</div>
													<AudioControls
														src={getExampleAudioUrl(ex.word)}
														label={`Play ${ex.word}`}
													/>
												</div>
											))}
										</div>
									) : null}
								</div>
							))}
						</div>
					</section>
				</>
			) : null}
		</div>
	);
}

function ConsonantProperties({ phoneme }: { phoneme: ConsonantPhoneme }) {
	const properties = [
		{ label: "Place", value: phoneme.articulation.place },
		{ label: "Manner", value: phoneme.articulation.manner },
		{ label: "Voicing", value: phoneme.articulation.voicing },
	];

	return (
		<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
			{properties.map(({ label, value }) => (
				<div key={label} className="contents">
					<dt className="font-medium text-muted-foreground">{label}:</dt>
					<dd className="capitalize">{value}</dd>
				</div>
			))}
		</dl>
	);
}

function VowelProperties({ phoneme }: { phoneme: VowelPhoneme }) {
	const properties: Array<{ label: string; value: string }> = [
		{ label: "Height", value: phoneme.articulation.height },
		{ label: "Frontness", value: phoneme.articulation.frontness },
		{ label: "Roundness", value: phoneme.articulation.roundness },
		{ label: "Tenseness", value: phoneme.articulation.tenseness },
	];

	if (phoneme.articulation.rhoticity) {
		properties.push({ label: "Rhoticity", value: phoneme.articulation.rhoticity });
	}

	return (
		<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
			{properties.map(({ label, value }) => (
				<div key={label} className="contents">
					<dt className="font-medium text-muted-foreground">{label}:</dt>
					<dd className="capitalize">{value}</dd>
				</div>
			))}
		</dl>
	);
}
