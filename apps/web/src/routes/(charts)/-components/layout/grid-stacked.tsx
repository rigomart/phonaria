import type { ConsonantPhoneme, IpaPhoneme, VowelPhoneme } from "shared-data";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";
import { ConsonantCell } from "@/routes/(charts)/-components/chart/consonant-cell";
import { VowelCell } from "@/routes/(charts)/-components/chart/vowel-cell";
import { InfoPopover } from "@/routes/(charts)/-components/info/info-popover";
import { VOWEL_FRONTS, VOWEL_HEIGHTS } from "@/routes/(charts)/-hooks/use-vowel-grid";

interface GridStackedProps<T extends IpaPhoneme> {
	type: "consonant" | "vowel";
	grid: Record<string, Record<string, T[]>>;
	onSelect: (phoneme: T) => void;
}

export function GridStacked<T extends IpaPhoneme>({ type, grid, onSelect }: GridStackedProps<T>) {
	if (type === "consonant") {
		const consonantGrid = grid as Record<string, Record<string, ConsonantPhoneme[]>>;

		return (
			<div className="space-y-6">
				<p id="consonants-caption" className="sr-only">
					Rows: Manner of articulation • Columns: Place of articulation
				</p>

				{MANNERS.map((manner) => {
					const columns = PLACES.filter((place) => consonantGrid[manner][place]?.length);
					if (!columns.length) return null;

					return (
						<section
							key={manner}
							className="space-y-3"
							aria-labelledby={`manner-${manner}`}
							aria-describedby="consonants-caption"
						>
							<h3
								id={`manner-${manner}`}
								className="px-2 text-sm font-medium text-muted-foreground"
							>
								<span className="mr-2">Manner</span>
								<InfoPopover type="manner" id={manner}>
									<button
										type="button"
										className="capitalize font-semibold text-foreground underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{manner}
									</button>
								</InfoPopover>
							</h3>

							<div className="-mx-2 overflow-x-auto px-2 pb-2">
								<div className="flex gap-3">
									{columns.map((place) => (
										<div key={place} className="min-w-40 shrink-0 rounded-md border p-3">
											<div className="mb-2">
												<div className="text-[11px] uppercase tracking-wide text-muted-foreground">
													Place
												</div>
												<div className="text-sm font-semibold">
													<InfoPopover type="place" id={place}>
														<button
															type="button"
															className="capitalize underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
														>
															{place}
														</button>
													</InfoPopover>
												</div>
											</div>

											<ConsonantCell
												phonemes={consonantGrid[manner][place]}
												onSelect={onSelect as (phoneme: ConsonantPhoneme) => void}
											/>
										</div>
									))}
								</div>
							</div>
						</section>
					);
				})}
			</div>
		);
	} else {
		const vowelGrid = grid as Record<string, Record<string, VowelPhoneme[]>>;

		return (
			<div className="space-y-6">
				<p id="vowels-caption" className="sr-only">
					Rows: Height / Openness • Columns: Frontness / Backness
				</p>

				{VOWEL_HEIGHTS.map((height) => {
					const columns = VOWEL_FRONTS.filter((front) => vowelGrid[height][front]?.length);
					if (!columns.length) return null;

					return (
						<section
							key={height}
							className="space-y-3"
							aria-labelledby={`height-${height}`}
							aria-describedby="vowels-caption"
						>
							<h3
								id={`height-${height}`}
								className="px-2 text-sm font-medium text-muted-foreground"
							>
								<span className="mr-2">Height</span>
								<InfoPopover type="height" id={height}>
									<button
										type="button"
										className="capitalize font-semibold text-foreground underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{height.replace("near-", "near ")}
									</button>
								</InfoPopover>
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
													<InfoPopover type="frontness" id={front}>
														<button
															type="button"
															className="capitalize underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
														>
															{front.replace("near-", "near ")}
														</button>
													</InfoPopover>
												</div>
											</div>

											<VowelCell
												vowels={vowelGrid[height][front]}
												onSelect={onSelect as (phoneme: VowelPhoneme) => void}
											/>
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
}
