import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { consonants, phonixUtils } from "shared-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

// Helper: retrieve all consonants for a given place+manner (expect 0-2, voiceless + voiced)
function getCellPhonemes(place: string, manner: string): ConsonantPhoneme[] {
	return consonants
		.filter((c) => c.articulation.place === place && c.articulation.manner === manner)
		.sort((a) => (a.articulation.voicing === "voiceless" ? -1 : 1));
}

// Play first example for a phoneme
function playExample(p: ConsonantPhoneme) {
	const first = p.examples[0];
	if (!first) return;
	playWord(first.word);
}

// Play audio for a specific example word
function playWord(word: string) {
	const audio = new Audio(getExampleAudioUrl(word));
	audio.play().catch(() => {
		/* ignore */
	});
}
export function ConsonantChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<ConsonantPhoneme | null>(null);

	function openDetails(p: ConsonantPhoneme) {
		setSelected(p);
		setOpen(true);
	}

	return (
		<>
			<div className="mt-6 space-y-4">
				{/* Legend */}
				<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
					<div className="flex items-center gap-1">
						<span className="inline-flex h-6 w-6 items-center justify-center rounded border text-[0.85rem] font-semibold">
							p
						</span>{" "}
						Voiceless
					</div>
					<div className="flex items-center gap-1">
						<span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-[0.85rem] font-semibold">
							b
						</span>{" "}
						Voiced
					</div>
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">Tap symbol: play • Info: details</span>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table
						aria-label="Consonant chart organized by manner and place of articulation"
						className="min-w-[56rem] border-collapse text-xs"
					>
						<thead className="text-muted-foreground font-medium uppercase tracking-wide">
							<tr className="border-b">
								<th scope="col" className="pl-2 text-left font-medium">
									Manner ↓ / Place →
								</th>
								{PLACES.map((place) => (
									<th key={place} scope="col" className="text-center font-medium capitalize">
										{place.replace("postalveolar", "post-alv")}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{MANNERS.map((manner) => (
								<tr key={manner} className="border-b last:border-b-0">
									<th
										scope="row"
										className="pr-2 text-sm font-medium capitalize text-muted-foreground text-left align-middle"
									>
										{manner}
									</th>
									{PLACES.map((place) => {
										const items = getCellPhonemes(place, manner);
										return (
											<td key={place} className="p-0 text-center align-middle">
												{items.length === 0 ? (
													<div className="flex h-10 items-center justify-center">
														<div className="h-2 w-2 rounded-full bg-border" aria-hidden="true" />
													</div>
												) : (
													<div className="flex h-10 items-center justify-center gap-1">
														{items.map((p) => (
															<Tooltip key={p.symbol}>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		onClick={() => playExample(p)}
																		onDoubleClick={() => openDetails(p)}
																		aria-label={`${toPhonemic(p.symbol)} ${p.articulation.voicing} ${p.articulation.place} ${p.articulation.manner}. Tap to play; double tap for details.`}
																		className={
																			"group relative inline-flex h-10 w-10 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
																			(p.articulation.voicing === "voiceless"
																				? "border text-base"
																				: "bg-primary/10 text-base")
																		}
																	>
																		<span className="pointer-events-none select-none text-lg leading-none">
																			{p.symbol}
																		</span>
																		<Button
																			type="button"
																			size="icon"
																			variant="ghost"
																			aria-label={`Open details for ${toPhonemic(p.symbol)}`}
																			onClick={(e) => {
																				e.stopPropagation();
																				openDetails(p);
																			}}
																			className="absolute -right-1 -top-1 h-5 w-5 rounded border bg-background/80 p-0 text-[10px] font-medium shadow backdrop-blur hover:bg-background"
																		>
																			i
																		</Button>
																	</button>
																</TooltipTrigger>
																<TooltipContent side="top" align="center">
																	<div className="max-w-[12rem] text-pretty text-xs leading-snug">
																		<div className="font-medium">
																			{toPhonemic(p.symbol)} {p.description}
																		</div>
																		{p.examples[0] ? (
																			<div className="flex items-center gap-1">
																				<span>{p.examples[0].word}</span>
																				<span className="text-muted-foreground">
																					{toPhonemic(p.examples[0].phonemic)}
																				</span>
																			</div>
																		) : null}
																		<div className="text-[10px] text-muted-foreground">
																			Info for full details
																		</div>
																	</div>
																</TooltipContent>
															</Tooltip>
														))}
													</div>
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<Dialog
				open={open}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
					setOpen(o);
				}}
			>
				<DialogContent className="max-w-3xl">
					{selected ? (
						<div className="flex flex-col gap-8">
							{/* Hero + Illustration */}
							<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
								<div className="space-y-4">
									<DialogHeader className="space-y-3 p-0">
										<DialogTitle className="flex items-start gap-3">
											<span className="text-5xl font-semibold leading-none tracking-tight">
												{selected.symbol}
											</span>
											<span className="mt-2 text-lg text-muted-foreground">
												{toPhonemic(selected.symbol)}
											</span>
										</DialogTitle>
										<div className="flex flex-wrap gap-2">
											<span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
												{selected.articulation.voicing}
											</span>
											<span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
												{selected.articulation.place}
											</span>
											<span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
												{selected.articulation.manner}
											</span>
										</div>
										<p className="text-sm text-muted-foreground max-w-prose">
											{selected.description}
										</p>
									</DialogHeader>
									{selected.guide ? (
										<section className="space-y-2">
											<h3 className="text-sm font-medium">How to Make It</h3>
											<p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
												{selected.guide}
											</p>
										</section>
									) : null}
								</div>
								<div className="md:sticky md:top-4">
									<div
										className="aspect-square w-full max-w-[16rem] rounded-md border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground"
										role="img"
										aria-label="Articulation illustration placeholder"
									>
										Illustration
									</div>
								</div>
							</div>

							{/* Examples */}
							<section className="space-y-3">
								<h3 className="text-sm font-medium">Examples</h3>
								<ul className="grid gap-2 sm:grid-cols-2">
									{selected.examples.map((ex) => (
										<li
											key={ex.word}
											className="flex items-center justify-between gap-3 rounded-md border p-2"
										>
											<div>
												<div className="font-medium">{ex.word}</div>
												<div className="text-muted-foreground text-sm">
													{toPhonemic(ex.phonemic)}
												</div>
											</div>
											<Button
												size="icon"
												variant="ghost"
												aria-label={`Play ${ex.word}`}
												onClick={() => playWord(ex.word)}
												className="h-8 w-8"
											>
												▶
											</Button>
										</li>
									))}
								</ul>
							</section>

							{/* Allophones */}
							{selected.allophones?.length ? (
								<section className="space-y-3">
									<h3 className="text-sm font-medium">Allophones & Context</h3>
									<ul className="space-y-3">
										{selected.allophones.map((allo) => (
											<li
												key={allo.variant}
												className="rounded-md border p-3 space-y-2 bg-muted/10"
											>
												<div className="flex flex-wrap items-baseline gap-2">
													<span className="font-medium text-base">{allo.variant}</span>
													<span className="text-sm text-muted-foreground">{allo.description}</span>
												</div>
												{allo.context ? (
													<div className="text-xs text-muted-foreground">
														Context: {allo.context}
													</div>
												) : null}
												{allo.examples?.length ? (
													<ul className="space-y-1">
														{allo.examples.map((ex) => (
															<li
																key={ex.word}
																className="flex items-center justify-between gap-3 rounded-md border p-2"
															>
																<div>
																	<div className="text-sm">{ex.word}</div>
																	<div className="text-xs text-muted-foreground">
																		{toPhonemic(ex.phonemic)}
																	</div>
																</div>
																<Button
																	size="icon"
																	variant="ghost"
																	aria-label={`Play ${ex.word}`}
																	onClick={() => playWord(ex.word)}
																	className="h-6 w-6 p-0"
																>
																	▶
																</Button>
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
