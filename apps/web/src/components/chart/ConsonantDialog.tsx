import type { ConsonantPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

interface ConsonantDialogProps {
	phoneme: ConsonantPhoneme | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ConsonantDialog({ phoneme, open, onOpenChange }: ConsonantDialogProps) {
	function playWord(word: string) {
		const audio = new Audio(getExampleAudioUrl(word));
		audio.play().catch(() => {});
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				{phoneme ? (
					<div className="flex flex-col gap-10">
						<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
							<div className="space-y-5">
								<DialogHeader className="space-y-4 p-0">
									<DialogTitle className="flex items-center">
										<span className="text-5xl text-muted-foreground">/</span>
										<span className="text-6xl font-semibold leading-none tracking-tight">
											{phoneme.symbol}
										</span>
										<span className="text-5xl text-muted-foreground">/</span>
									</DialogTitle>
									<div className="flex flex-wrap gap-2">
										<span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
											{phoneme.articulation.voicing}
										</span>
										<span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
											{phoneme.articulation.place}
										</span>
										<span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
											{phoneme.articulation.manner}
										</span>
									</div>
									<p className="text-sm text-muted-foreground max-w-prose">{phoneme.description}</p>
								</DialogHeader>
								{phoneme.guide ? (
									<section className="space-y-2">
										<h3 className="text-sm font-medium">How to Make It</h3>
										<p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
											{phoneme.guide}
										</p>
									</section>
								) : null}
							</div>
							<div className="mt-5">
								<div
									className="aspect-square w-full max-w-[16rem] rounded-md border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground"
									role="img"
									aria-label="Articulation illustration placeholder"
								>
									Illustration
								</div>
							</div>
						</div>
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
						{phoneme.allophones?.length ? (
							<section className="space-y-4">
								<h3 className="text-sm font-medium">Allophones</h3>
								<ul className="space-y-4">
									{phoneme.allophones.map((allo) => (
										<li key={allo.variant} className="rounded-md border p-4 space-y-3 bg-muted/10">
											<div className="flex flex-wrap items-baseline gap-2">
												<span className="font-medium text-base">{allo.variant}</span>
												<span className="text-sm text-muted-foreground">{allo.description}</span>
											</div>
											{allo.context ? (
												<div className="text-xs text-muted-foreground">Context: {allo.context}</div>
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
	);
}
