import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { consonants, phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio/AudioButton";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

export function ConsonantChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<ConsonantPhoneme | null>(null);

	function handleOpen(p: ConsonantPhoneme) {
		setSelected(p);
		setOpen(true);
	}

	return (
		<>
			<div className="mt-4 space-y-6">
				{MANNERS.map((manner) => {
					const items = consonants
						.filter((c) => c.articulation.manner === manner)
						.sort(
							(a, b) =>
								PLACES.indexOf(a.articulation.place as (typeof PLACES)[number]) -
								PLACES.indexOf(b.articulation.place as (typeof PLACES)[number]),
						);
					if (!items.length) return null;
					return (
						<section key={manner}>
							<h3 className="mb-2 text-sm font-medium capitalize text-muted-foreground">
								{manner}
							</h3>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
								{items.map((p) => (
									<Tooltip key={p.symbol}>
										<TooltipTrigger asChild>
											<div>
												<PhonemeTile phoneme={p} onOpen={handleOpen} />
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<div className="max-w-xs text-pretty">
												<span className="font-medium">{p.symbol}</span> {toPhonemic(p.symbol)} —{" "}
												{p.description}
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

							<div className="flex flex-col gap-4 sm:flex-row">
								<div
									className="aspect-square w-full max-w-[10rem] rounded-md border bg-muted/30"
									aria-hidden="true"
								/>
								<section className="text-sm flex-1">
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
							</div>

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
