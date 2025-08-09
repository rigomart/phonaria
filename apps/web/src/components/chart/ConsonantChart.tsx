import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { consonants, phonixUtils } from "shared-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

function getCellPhonemes(place: string, manner: string): ConsonantPhoneme[] {
	return consonants
		.filter((c) => c.articulation.place === place && c.articulation.manner === manner)
		.sort((a) => (a.articulation.voicing === "voiceless" ? -1 : 1));
}

function playWord(word: string) {
	const audio = new Audio(getExampleAudioUrl(word));
	audio.play().catch(() => {});
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
			<div className="mt-6 space-y-5 px-2">
				{/* Legend */}
				<div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded-full border" />
						<span>Voiceless</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded-full border bg-primary/10" />
						<span>Voiced</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">Tap symbol: details</span>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table
						aria-label="Consonant chart organized by manner and place of articulation"
						className="min-w-[60rem] border-collapse text-sm"
					>
						<caption className="caption-top mb-3 text-sm text-muted-foreground font-normal">
							Rows: <span className="font-medium">Manner of articulation</span> • Columns:{" "}
							<span className="font-medium">Place of articulation</span>
						</caption>
						<thead className="text-muted-foreground font-medium uppercase tracking-wide text-xs">
							<tr className="border-b">
								<th
									scope="col"
									className="pl-3 pr-4 py-3 text-left font-medium text-xs bg-muted/40 rounded-tl align-bottom"
								>
									<span className="sr-only">Corner (see caption for axis labels)</span>
								</th>
								{PLACES.map((place) => (
									<th
										key={place}
										scope="col"
										className="px-3 py-3 text-center font-medium capitalize text-xs"
									>
										{place.replace("postalveolar", "post-alv")}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{MANNERS.map((manner) => (
								<tr key={manner} className={`border-b last:border-b-0`}>
									<th
										scope="row"
										className="px-3 text-sm font-medium capitalize text-muted-foreground text-left align-middle"
									>
										{manner}
									</th>
									{PLACES.map((place) => {
										const items = getCellPhonemes(place, manner);
										return (
											<td key={place} className="text-center align-middle">
												{items.length === 0 ? (
													<div className="flex h-14 items-center justify-center">
														<div
															className="h-2.5 w-2.5 rounded-full bg-border"
															aria-hidden="true"
														/>
													</div>
												) : (
													<div className="flex h-14 items-center justify-center gap-1">
														{items.map((p) => (
															<Tooltip key={p.symbol}>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		onClick={() => openDetails(p)}
																		aria-label={`${toPhonemic(p.symbol)} ${p.articulation.voicing} ${p.articulation.place} ${p.articulation.manner}. Tap for details.`}
																		className={
																			"group relative inline-flex h-14 w-14 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
																			(p.articulation.voicing === "voiceless"
																				? "border"
																				: "bg-primary/10")
																		}
																	>
																		<span className="pointer-events-none select-none text-xl sm:text-2xl leading-none">
																			{p.symbol}
																		</span>
																	</button>
																</TooltipTrigger>
																<TooltipContent side="top" align="center">
																	<div className="max-w-[14rem] text-pretty text-xs leading-snug">
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
																			Tap for details
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
						<div className="flex flex-col gap-10">
							{/* Hero + Illustration */}
							<div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem]">
								<div className="space-y-5">
									<DialogHeader className="space-y-4 p-0">
										<DialogTitle className="flex items-start gap-4">
											<span className="text-6xl font-semibold leading-none tracking-tight">
												{selected.symbol}
											</span>
											<span className="mt-3 text-xl text-muted-foreground">
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
							<section className="space-y-4">
								<h3 className="text-sm font-medium">Examples</h3>
								<ul className="grid gap-3 sm:grid-cols-2">
									{selected.examples.map((ex) => (
										<li
											key={ex.word}
											className="flex items-center justify-between gap-4 rounded-md border p-3"
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
								<section className="space-y-4">
									<h3 className="text-sm font-medium">Allophones & Context</h3>
									<ul className="space-y-4">
										{selected.allophones.map((allo) => (
											<li
												key={allo.variant}
												className="rounded-md border p-4 space-y-3 bg-muted/10"
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
													<ul className="space-y-2">
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
