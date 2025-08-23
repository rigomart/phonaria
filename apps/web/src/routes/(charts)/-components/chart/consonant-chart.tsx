import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { PhonemeDialog } from "@/components/phoneme-dialog";
import { PhonemeGridLayout } from "@/routes/(charts)/-components/core/phoneme-grid";
import { PhonemeMatrix } from "@/routes/(charts)/-components/core/phoneme-matrix";
import { useConsonantGrid } from "@/routes/(charts)/-hooks/use-consonant-grid";
import { ConsonantVoiceIndicator } from "../core/consonant-voice-indicator";

export function ConsonantChart() {
	const grid = useConsonantGrid();
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<ConsonantPhoneme | null>(null);

	const openDetails = React.useCallback((phoneme: ConsonantPhoneme) => {
		setSelected(phoneme);
		setOpen(true);
	}, []);

	return (
		<>
			<div className="mt-6 space-y-5 px-2">
				{/* Legend */}
				<div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center h-6 w-6 rounded border">
							<ConsonantVoiceIndicator type="voiceless" />
						</div>
						<span>Voiceless</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center h-6 w-6 rounded border bg-primary/10">
							<ConsonantVoiceIndicator type="voiced" />
						</div>
						<span>Voiced</span>
					</div>
				</div>

				<div className="md:hidden">
					<PhonemeGridLayout type="consonant" grid={grid} onSelect={openDetails} />
				</div>
				<div className="hidden md:block">
					<PhonemeMatrix type="consonant" grid={grid} onSelect={openDetails} />
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
