import * as React from "react";
import type { ConsonantPhoneme, IpaPhoneme, VowelPhoneme } from "shared-data";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";
import { ConsonantCell } from "@/routes/(charts)/-components/chart/consonant-cell";
import { VowelCell } from "@/routes/(charts)/-components/chart/vowel-cell";
import { InfoPopover } from "@/routes/(charts)/-components/info/info-popover";
import { VOWEL_FRONTS, VOWEL_HEIGHTS } from "@/routes/(charts)/-hooks/use-vowel-grid";

interface GridMatrixProps<T extends IpaPhoneme> {
	type: "consonant" | "vowel";
	grid: Record<string, Record<string, T[]>>;
	onSelect: (phoneme: T) => void;
}

export function GridMatrix<T extends IpaPhoneme>({ type, grid, onSelect }: GridMatrixProps<T>) {
	if (type === "consonant") {
		const consonantGrid = grid as Record<string, Record<string, ConsonantPhoneme[]>>;

		return (
			<div className="space-y-3">
				<p id="consonants-matrix-caption" className="sr-only">
					Rows: Manner of articulation • Columns: Place of articulation
				</p>

				<div className="overflow-x-auto">
					<div
						className="inline-grid rounded-md border text-sm"
						style={{
							gridTemplateColumns: `max-content repeat(${PLACES.length}, minmax(4rem, 1fr))`,
						}}
						aria-describedby="consonants-matrix-caption"
					>
						<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

						{PLACES.map((place, i) => (
							<div
								key={place}
								className={[
									"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
									i === PLACES.length - 1 ? "border-b" : "border-b border-r",
								].join(" ")}
							>
								<InfoPopover type="place" id={place}>
									<button
										type="button"
										className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{place}
									</button>
								</InfoPopover>
							</div>
						))}

						{MANNERS.map((manner, rIndex) => (
							<React.Fragment key={manner}>
								<div
									className={[
										"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
										rIndex === MANNERS.length - 1 ? "border-r" : "border-b border-r",
									].join(" ")}
								>
									<InfoPopover type="manner" id={manner}>
										<button
											type="button"
											className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
										>
											{manner}
										</button>
									</InfoPopover>
								</div>

								{PLACES.map((place, cIndex) => (
									<div
										key={`${manner}-${place}`}
										className={[
											"p-2 text-center align-middle",
											rIndex === MANNERS.length - 1
												? cIndex === PLACES.length - 1
													? ""
													: "border-r"
												: cIndex === PLACES.length - 1
													? "border-b"
													: "border-b border-r",
										].join(" ")}
									>
										<ConsonantCell
											phonemes={consonantGrid[manner][place]}
											onSelect={onSelect as (phoneme: ConsonantPhoneme) => void}
										/>
									</div>
								))}
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
		);
	} else {
		const vowelGrid = grid as Record<string, Record<string, VowelPhoneme[]>>;

		return (
			<div className="space-y-3">
				<p id="vowels-matrix-caption" className="sr-only">
					Rows: Height / Openness • Columns: Frontness / Backness
				</p>

				<div className="overflow-x-auto">
					<div
						className="inline-grid rounded-md border text-sm"
						style={{
							gridTemplateColumns: `max-content repeat(${VOWEL_FRONTS.length}, minmax(4rem, 1fr))`,
						}}
						aria-describedby="vowels-matrix-caption"
					>
						<div className="sticky top-0 left-0 z-20 bg-background px-3 py-3 border-b border-r rounded-tl-md" />

						{VOWEL_FRONTS.map((front, i) => (
							<div
								key={front}
								className={[
									"sticky top-0 z-10 bg-background px-3 py-3 text-center font-medium capitalize text-xs",
									i === VOWEL_FRONTS.length - 1 ? "border-b" : "border-b border-r",
								].join(" ")}
							>
								<InfoPopover type="frontness" id={front}>
									<button
										type="button"
										className="capitalize underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
									>
										{front.replace("near-", "near ")}
									</button>
								</InfoPopover>
							</div>
						))}

						{VOWEL_HEIGHTS.map((height, rIndex) => (
							<React.Fragment key={height}>
								<div
									className={[
										"sticky left-0 z-10 bg-background px-3 py-2 text-left align-middle text-sm font-medium capitalize text-muted-foreground",
										rIndex === VOWEL_HEIGHTS.length - 1 ? "border-r" : "border-b border-r",
									].join(" ")}
								>
									<InfoPopover type="height" id={height}>
										<button
											type="button"
											className="capitalize text-left underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
										>
											{height.replace("near-", "near ")}
										</button>
									</InfoPopover>
								</div>

								{VOWEL_FRONTS.map((front, cIndex) => (
									<div
										key={`${height}-${front}`}
										className={[
											"p-2 text-center align-middle",
											rIndex === VOWEL_HEIGHTS.length - 1
												? cIndex === VOWEL_FRONTS.length - 1
													? ""
													: "border-r"
												: cIndex === VOWEL_FRONTS.length - 1
													? "border-b"
													: "border-b border-r",
										].join(" ")}
									>
										<VowelCell
											vowels={vowelGrid[height][front]}
											onSelect={onSelect as (phoneme: VowelPhoneme) => void}
										/>
									</div>
								))}
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
		);
	}
}
