"use client";

import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { usePhonemeDetailsContext } from "./index";

export function TabHowTo() {
	const { phoneme, layout } = usePhonemeDetailsContext();

	const sagittalSize = layout === "compact" ? 180 : layout === "comfortable" ? 220 : 240;
	const pitfallsText = "pitfalls" in phoneme ? (phoneme.pitfalls as string | undefined) : undefined;
	const isCompact = layout === "compact";

	return (
		<div className={`pb-2 ${isCompact ? "space-y-4" : "grid grid-cols-2 gap-6"}`}>
			<div className="flex items-start justify-center">
				<div
					className="rounded-lg border bg-muted/30 text-muted-foreground flex items-center justify-center select-none shrink-0"
					style={{ width: `${sagittalSize}px`, height: `${sagittalSize}px` }}
					role="img"
					aria-label={`Side view diagram of ${phoneme.symbol} articulation`}
				>
					<span className="text-xs text-center px-4">Sagittal diagram</span>
				</div>
			</div>

			<div className="space-y-4">
				<section className="space-y-2">
					<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Articulation
					</h4>
					{phoneme.category === "consonant" ? (
						<ConsonantProperties phoneme={phoneme as ConsonantPhoneme} />
					) : (
						<VowelProperties phoneme={phoneme as VowelPhoneme} />
					)}
				</section>

				{phoneme.guide ? (
					<section className="space-y-2">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							How to Make It
						</h4>
						<p className="text-sm leading-relaxed text-foreground">{phoneme.guide}</p>
					</section>
				) : null}

				{pitfallsText ? (
					<section className="space-y-2">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
							Common Mistakes
						</h4>
						<p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-md p-2 border border-amber-200 dark:border-amber-900">
							{pitfallsText}
						</p>
					</section>
				) : null}
			</div>
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
		<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
			{properties.map(({ label, value }) => (
				<div key={label} className="contents">
					<dt className="text-muted-foreground">{label}:</dt>
					<dd className="capitalize font-medium">{value}</dd>
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
		<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
			{properties.map(({ label, value }) => (
				<div key={label} className="contents">
					<dt className="text-muted-foreground">{label}:</dt>
					<dd className="capitalize font-medium">{value}</dd>
				</div>
			))}
		</dl>
	);
}
