import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { consonants, phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio/AudioButton";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildConsonantGrid, MANNERS, PLACES } from "@/lib/phoneme-helpers";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

export function ConsonantChart() {
	const grid = buildConsonantGrid(consonants);
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<ConsonantPhoneme | null>(null);
	const [showVoiced, setShowVoiced] = React.useState(true);
	const [showVoiceless, setShowVoiceless] = React.useState(true);
	const [, setFocusIdx] = React.useState<{ r: number; c: number }>({ r: 0, c: 0 });
	const tableRef = React.useRef<HTMLTableElement | null>(null);

	function moveFocus(dr: number, dc: number) {
		setFocusIdx((idx) => {
			const r = Math.max(0, Math.min(MANNERS.length - 1, idx.r + dr));
			const c = Math.max(0, Math.min(PLACES.length - 1, idx.c + dc));
			const el = tableRef.current?.querySelector<HTMLButtonElement>(`button[data-cell="${r}-${c}"]`);
			el?.focus();
			return { r, c };
		});
	}

	function handleOpen(p: ConsonantPhoneme) {
		setSelected(p);
		setOpen(true);
	}

	return (
		<>
			<div className="mt-4 w-full overflow-x-auto">
				<div className="mb-3 flex items-center justify-between gap-3">
					<div className="text-xs text-muted-foreground">Rows: manner • Columns: place</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							size="sm"
							variant={showVoiced ? "default" : "outline"}
							onClick={() => setShowVoiced((v) => !v)}
							aria-pressed={showVoiced}
						>
							Voiced
						</Button>
						<Button
							type="button"
							size="sm"
							variant={showVoiceless ? "default" : "outline"}
							onClick={() => setShowVoiceless((v) => !v)}
							aria-pressed={showVoiceless}
						>
							Voiceless
						</Button>
					</div>
				</div>
				<table ref={tableRef} className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="sticky left-0 z-10 bg-background p-2 text-left">Manner \\ Place</th>
							{PLACES.map((place) => (
								<th key={place} className="border p-2 capitalize">
									{place}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{MANNERS.map((manner, r) => (
							<tr key={manner}>
								<th className="sticky left-0 z-10 bg-background p-2 text-left capitalize">
									{manner}
								</th>
								{PLACES.map((place, c) => {
									const p = grid[manner][place];
									const allowed = p
										? (p.articulation.voicing === "voiced" && showVoiced) ||
											(p.articulation.voicing === "voiceless" && showVoiceless)
										: false;
									return (
										<td key={`${manner}-${place}`} className="border p-2 align-top">
											{p && allowed ? (
												<Tooltip>
													<TooltipTrigger asChild>
														<div>
															<PhonemeTile
																phoneme={p}
																onOpen={handleOpen}
																buttonProps={{
																	id: `cell-${r}-${c}`,
																	onKeyDown: (e) => {
																		if (e.key === "ArrowDown") moveFocus(1, 0);
																		else if (e.key === "ArrowUp") moveFocus(-1, 0);
																		else if (e.key === "ArrowRight") moveFocus(0, 1);
																		else if (e.key === "ArrowLeft") moveFocus(0, -1);
																		else if (e.key === "Enter") handleOpen(p);
																	},
																}}
															/>
														</div>
													</TooltipTrigger>
													<TooltipContent>
														<div className="max-w-xs text-pretty">
															<span className="font-medium">{p.symbol}</span> {toPhonemic(p.symbol)}{" "}
															— {p.description}
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
										Place:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.place}
										</span>
									</li>
									<li>
										Manner:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.manner}
										</span>
									</li>
									<li>
										Voicing:{" "}
										<span className="capitalize text-foreground">
											{selected.articulation.voicing}
										</span>
									</li>
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

							{selected.allophones && selected.allophones.length > 0 ? (
								<section className="text-sm">
									<h3 className="mb-1 font-medium">Allophones</h3>
									<ul className="space-y-2">
										{selected.allophones.map((allo) => (
											<li key={allo.variant} className="rounded-md border p-2">
												<div className="mb-1 font-medium">
													{allo.variant} — {allo.description}
												</div>
												{allo.context ? (
													<div className="mb-1 text-xs text-muted-foreground">
														Context: {allo.context}
													</div>
												) : null}
												{allo.examples?.length ? (
													<ul className="mt-2 space-y-1">
														{allo.examples.map((ex) => (
															<li key={ex.word} className="flex items-center justify-between gap-3">
																<div>
																	<div className="text-sm">{ex.word}</div>
																	<div className="text-xs text-muted-foreground">
																		{toPhonemic(ex.phonemic)}
																	</div>
																</div>
																<AudioButton
																	src={getExampleAudioUrl(ex.word)}
																	label={`Play ${ex.word}`}
																/>
															</li>
														))}
													</ul>
												) : null}
											</li>
										))}
									</ul>
								</section>
							) : null}
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
