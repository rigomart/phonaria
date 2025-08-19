import type { VowelPhoneme } from "shared-data";
import { useVowelGrid, VOWEL_FRONTS, VOWEL_HEIGHTS } from "../../-hooks/use-vowel-grid";
import { VowelAxisInfoPopover } from "./vowel-axis-info-popover";
import { VowelCell } from "./vowel-cell";

type Props = { onSelect: (v: VowelPhoneme) => void };

export function VowelGridStacked({ onSelect }: Props) {
	const grid = useVowelGrid();

	return (
		<div className="space-y-6">
			<p id="vowels-caption" className="sr-only">
				Rows: Height / Openness • Columns: Frontness / Backness
			</p>

			{VOWEL_HEIGHTS.map((height) => {
				const columns = VOWEL_FRONTS.filter((front) => grid[height][front]?.length);
				if (!columns.length) return null;

				return (
					<section
						key={height}
						className="space-y-3"
						aria-labelledby={`height-${height}`}
						aria-describedby="vowels-caption"
					>
						<h3 id={`height-${height}`} className="px-2 text-sm font-medium text-muted-foreground">
							<span className="mr-2">Height</span>
							<VowelAxisInfoPopover type="height" id={height}>
								<button
									type="button"
									className="capitalize font-semibold text-foreground underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
								>
									{height.replace("near-", "near ")}
								</button>
							</VowelAxisInfoPopover>
						</h3>

						<div className="-mx-2 overflow-x-auto px-2 pb-2">
							<div className="flex gap-3">
								{columns.map((front) => (
									<div key={front} className="min-w-40 shrink-0 rounded-md border p-3">
										<div className="mb-2">
											<div className="text-[11px] uppercase tracking-wide text-muted-foreground">
												Frontness
											</div>
											<div className="text-sm font-semibold">
												<VowelAxisInfoPopover type="frontness" id={front}>
													<button
														type="button"
														className="capitalize underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
													>
														{front.replace("near-", "near ")}
													</button>
												</VowelAxisInfoPopover>
											</div>
										</div>

										<VowelCell vowels={grid[height][front]} onSelect={onSelect} />
									</div>
								))}
							</div>
						</div>
					</section>
				);
			})}
		</div>
	);
}
