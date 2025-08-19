import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { ConsonantGridMatrix } from "./consonant-grid-matrix";
import { ConsonantGridStacked } from "./consonant-grid-stacked";
import { PhonemeDialog } from "./phoneme-dialog";

export function ConsonantChart() {
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<ConsonantPhoneme | null>(null);

	const openDetails = React.useCallback((p: ConsonantPhoneme) => {
		setSelected(p);
		setOpen(true);
	}, []);

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
				</div>

				<div className="md:hidden">
					<ConsonantGridStacked onSelect={openDetails} />
				</div>
				<div className="hidden md:block">
					<ConsonantGridMatrix onSelect={openDetails} />
				</div>
			</div>
			<PhonemeDialog.Root
				open={open}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
					setOpen(o);
				}}
			>
				<PhonemeDialog.Content className="max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto">
					{selected ? (
						<div className="space-y-8">
							<PhonemeDialog.Header phoneme={selected} />
							<section className="space-y-3">
								<h3 className="text-sm font-medium">Sagittal view</h3>
								<div className="flex justify-center">
									<div
										className="aspect-square w-full max-w-[28rem] sm:max-w-[30rem] md:max-w-[32rem] rounded-lg border bg-muted/30 text-muted-foreground flex items-center justify-center select-none"
										role="img"
										aria-label="Sagittal view placeholder"
									>
										<span className="text-sm">Sagittal view placeholder</span>
									</div>
								</div>
							</section>
							<PhonemeDialog.ConsonantArticulation phoneme={selected} />
							{selected.guide ? <PhonemeDialog.Guide guide={selected.guide} /> : null}
							<PhonemeDialog.Examples examples={selected.examples} />
							{selected.allophones?.length ? (
								<PhonemeDialog.Allophones allophones={selected.allophones} />
							) : null}
						</div>
					) : null}
				</PhonemeDialog.Content>
			</PhonemeDialog.Root>
		</>
	);
}
