import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { phonixUtils, vowels } from "shared-data";
import { AudioButton } from "@/components/audio/AudioButton";
import { VowelTile } from "@/components/phoneme/VowelTile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

const HEIGHTS: VowelPhoneme["articulation"]["height"][] = [
	"high",
	"near-high",
	"high-mid",
	"mid",
	"low-mid",
	"near-low",
	"low",
];

const FRONTS: VowelPhoneme["articulation"]["frontness"][] = [
	"front",
	"near-front",
	"central",
	"near-back",
	"back",
];

export function VowelChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<VowelPhoneme | null>(null);

	function handleOpen(p: VowelPhoneme) {
		setSelected(p);
		setOpen(true);
	}

	return (
		<>
			<div className="mt-4 space-y-6">
				{HEIGHTS.map((h) => {
					const items = vowels
						.filter((v) => v.articulation.height === h)
						.sort(
							(a, b) =>
								FRONTS.indexOf(a.articulation.frontness as (typeof FRONTS)[number]) -
								FRONTS.indexOf(b.articulation.frontness as (typeof FRONTS)[number]),
						);
					if (!items.length) return null;
					return (
						<section key={h}>
							<h3 className="mb-2 text-sm font-medium capitalize text-muted-foreground">{h}</h3>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
								{items.map((v) => (
									<Tooltip key={v.symbol}>
										<TooltipTrigger asChild>
											<div>
												<VowelTile phoneme={v} onOpen={handleOpen} />
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<div className="max-w-xs text-pretty">
												<span className="font-medium">{v.symbol}</span> {toPhonemic(v.symbol)} —{" "}
												{v.description}
											</div>
										</TooltipContent>
									</Tooltip>
								))}
							</div>
						</section>
					);
				})}
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-md">
					{selected ? (
						<div className="space-y-4">
							<DialogHeader>
								<DialogTitle className="text-2xl font-semibold">
									{selected.symbol}{" "}
									<span className="ml-2 text-base text-muted-foreground">
										{toPhonemic(selected.symbol)}
									</span>
								</DialogTitle>
								<p className="text-sm text-muted-foreground">{selected.description}</p>
							</DialogHeader>

							<section className="text-sm">
								<h3 className="mb-1 font-medium">Articulation</h3>
								<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
									<li>
										Height:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.height}
										</span>
									</li>
									<li>
										Frontness:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.frontness}
										</span>
									</li>
									<li>
										Lip rounding:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.roundness}
										</span>
									</li>
									<li>
										Tenseness:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.tenseness}
										</span>
									</li>
									{selected.articulation.rhoticity ? (
										<li>
											Rhoticity:{" "}
											<span className="capitalize text-foreground">
												{selected.articulation.rhoticity}
											</span>
										</li>
									) : null}
								</ul>
							</section>

							<section className="text-sm">
								<h3 className="mb-1 font-medium">Examples</h3>
								<ul className="space-y-2">
									{selected.examples.map((ex) => (
										<li
											key={ex.word}
											className="flex items-center justify-between gap-3 rounded-md border p-2"
										>
											<div>
												<div className="font-medium">{ex.word}</div>
												<div className="text-muted-foreground">{toPhonemic(ex.phonemic)}</div>
											</div>
											<AudioButton src={getExampleAudioUrl(ex.word)} label={`Play ${ex.word}`} />
										</li>
									))}
								</ul>
							</section>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
