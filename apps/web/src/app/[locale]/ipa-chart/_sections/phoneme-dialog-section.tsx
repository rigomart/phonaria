"use client";

import { PhonemeDialog } from "@/components/phoneme-dialog";
import { useIpaChartStore } from "../_store/ipa-chart-store";

export function PhonemeDialogSection() {
	const dialogOpen = useIpaChartStore((s) => s.dialogOpen);
	const setDialogOpen = useIpaChartStore((s) => s.setDialogOpen);
	const selectedPhoneme = useIpaChartStore((s) => s.selectedPhoneme);

	return (
		<PhonemeDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
			<PhonemeDialog.Content className="max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto">
				{selectedPhoneme ? (
					<div className="space-y-8">
						<PhonemeDialog.Header phoneme={selectedPhoneme} />
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
						{selectedPhoneme.category === "consonant" ? (
							<PhonemeDialog.ConsonantArticulation phoneme={selectedPhoneme} />
						) : (
							<PhonemeDialog.VowelArticulation phoneme={selectedPhoneme} />
						)}
						{selectedPhoneme.guide ? <PhonemeDialog.Guide guide={selectedPhoneme.guide} /> : null}
						<PhonemeDialog.Examples examples={selectedPhoneme.examples} />
						{selectedPhoneme.allophones?.length ? (
							<PhonemeDialog.Allophones allophones={selectedPhoneme.allophones} />
						) : null}
					</div>
				) : null}
			</PhonemeDialog.Content>
		</PhonemeDialog.Root>
	);
}
