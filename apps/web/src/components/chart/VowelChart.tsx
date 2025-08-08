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

function buildVowelGrid(items: VowelPhoneme[]) {
	const grid: Record<string, Record<string, VowelPhoneme | null>> = {};
	for (const h of HEIGHTS) {
		grid[h] = {} as Record<string, VowelPhoneme | null>;
		for (const f of FRONTS) grid[h][f] = null;
	}
	for (const v of items) {
		const { height, frontness } = v.articulation;
		if (grid[height] && frontness in grid[height]) grid[height][frontness] = v;
	}
	return grid;
}

export function VowelChart() {
	const grid = buildVowelGrid(vowels);
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<VowelPhoneme | null>(null);

	function handleOpen(p: VowelPhoneme) {
		setSelected(p);
		setOpen(true);
	}

	return (
		<>
			<div className="mt-4 w-full overflow-x-auto">
				<div className="mb-3 text-xs text-muted-foreground">Rows: height • Columns: frontness</div>
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="sticky left-0 z-10 bg-background p-2 text-left">
								Height \\ Frontness
							</th>
							{FRONTS.map((f) => (
								<th key={f} className="border p-2 capitalize">
									{f}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{HEIGHTS.map((h) => (
							<tr key={h}>
								<th className="sticky left-0 z-10 bg-background p-2 text-left capitalize">{h}</th>
								{FRONTS.map((f) => {
									const v = grid[h][f];
									return (
										<td key={`${h}-${f}`} className="border p-2 align-top">
											{v ? (
												<Tooltip>
													<TooltipTrigger asChild>
														<div>
															<VowelTile phoneme={v} onOpen={handleOpen} />
														</div>
													</TooltipTrigger>
													<TooltipContent>
														<div className="max-w-xs text-pretty">
															<span className="font-medium">{v.symbol}</span> {toPhonemic(v.symbol)}{" "}
															— {v.description}
														</div>
													</TooltipContent>
												</Tooltip>
											) : (
												<div className="h-12" />
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
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
