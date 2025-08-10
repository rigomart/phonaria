import * as React from "react";
import type { VowelPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio/audio-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useVowelGrid, VOWEL_FRONTS, VOWEL_HEIGHTS } from "../../-hooks/use-vowel-grid";
import { VowelCell } from "./vowel-cell";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

export function VowelChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<VowelPhoneme | null>(null);
	const grid = useVowelGrid();
	const openDetails = React.useCallback((p: VowelPhoneme) => {
		setSelected(p);
		setOpen(true);
	}, []);
	return (
		<>
			<div className="mt-6 space-y-5 px-2">
				<div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded bg-primary/10" />
						<span>Tense</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded border" />
						<span>Lax / other</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative h-6 w-6 rounded-full border"></div>
						<span>Rounded</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative flex h-6 w-6 items-end justify-center rounded border">
							<div className="mb-1 h-0.5 w-4 rounded-full bg-primary/60" />
						</div>
						<span>Rhotic</span>
					</div>
				</div>
				<div className="overflow-x-auto">
					<Table
						aria-label="Vowel chart organized by height (rows) and frontness/backness (columns)"
						className="min-w-[52rem] text-sm"
					>
						<TableCaption className="mb-3 text-sm text-muted-foreground font-normal">
							Rows: <span className="font-medium">Height / Openness</span> • Columns:{" "}
							<span className="font-medium">Frontness / Backness</span>
						</TableCaption>
						<TableHeader className="text-xs">
							<TableRow>
								<TableHead className="pl-3 pr-4 py-3 text-left font-medium text-xs rounded-tl align-bottom">
									<span className="sr-only">Corner (see caption for axis labels)</span>
								</TableHead>
								{VOWEL_FRONTS.map((front) => (
									<TableHead
										key={front}
										className="px-3 py-3 text-center font-medium capitalize text-xs"
									>
										<span className="capitalize underline decoration-dotted underline-offset-4">
											{front.replace("near-", "near ")}
										</span>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{VOWEL_HEIGHTS.map((h) => (
								<TableRow key={h} className="border-b last:border-b-0">
									<TableHead
										scope="row"
										className="px-3 text-sm font-medium capitalize text-muted-foreground text-left align-middle"
									>
										<span className="capitalize underline decoration-dotted underline-offset-4">
											{h.replace("near-", "near ")}
										</span>
									</TableHead>
									{VOWEL_FRONTS.map((f) => (
										<TableCell key={f} className="text-center align-middle">
											<VowelCell vowels={grid[h][f]} onSelect={openDetails} />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
			<Dialog
				open={open}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
					setOpen(o);
				}}
			>
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
