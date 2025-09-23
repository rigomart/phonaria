"use client";

import { Fragment, useMemo } from "react";
import type { VowelPhoneme } from "shared-data";
import { cn } from "@/lib/utils";
import { useIpaChartStore } from "../_store/ipa-chart-store";

const HEIGHT_ORDER: Array<VowelPhoneme["articulation"]["height"]> = [
	"high",
	"near-high",
	"high-mid",
	"mid",
	"low-mid",
	"near-low",
	"low",
];

const FRONTNESS_ORDER: Array<VowelPhoneme["articulation"]["frontness"]> = [
	"front",
	"near-front",
	"central",
	"near-back",
	"back",
];

const HEIGHT_LABELS: Record<(typeof HEIGHT_ORDER)[number], string> = {
	high: "Close",
	"near-high": "Near-close",
	"high-mid": "Close-mid",
	mid: "Mid",
	"low-mid": "Open-mid",
	"near-low": "Near-open",
	low: "Open",
};

const FRONTNESS_LABELS: Record<(typeof FRONTNESS_ORDER)[number], string> = {
	front: "Front",
	"near-front": "Near-front",
	central: "Central",
	"near-back": "Near-back",
	back: "Back",
};

interface VowelChartProps {
	vowels: VowelPhoneme[];
}

export function VowelChart({ vowels }: VowelChartProps) {
	const selectPhoneme = useIpaChartStore((s) => s.selectPhoneme);

	const monophthongs = useMemo(
		() => vowels.filter((phoneme) => phoneme.type === "monophthong"),
		[vowels],
	);

	const cells = useMemo(() => {
		const map = new Map<string, VowelPhoneme[]>();

		for (const phoneme of monophthongs) {
			const { height, frontness } = phoneme.articulation;
			const key = `${height}-${frontness}`;
			const current = map.get(key) ?? [];
			current.push(phoneme);
			map.set(key, current);
		}

		return map;
	}, [monophthongs]);

	return (
		<div className="overflow-x-auto">
			<div className="inline-grid w-full min-w-max gap-1.5 grid-cols-[auto_repeat(5,minmax(4.25rem,1fr))]">
				<div />
				{FRONTNESS_ORDER.map((frontness) => (
					<div
						key={frontness}
						className="px-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
					>
						{FRONTNESS_LABELS[frontness]}
					</div>
				))}

				{HEIGHT_ORDER.map((height) => (
					<Fragment key={height}>
						<div className="flex items-center justify-end pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{HEIGHT_LABELS[height]}
						</div>
						{FRONTNESS_ORDER.map((frontness) => {
							const key = `${height}-${frontness}`;
							const phonemes = cells.get(key) ?? [];

							return (
								<div
									key={frontness}
									className={cn(
										"flex min-h-[3.25rem] flex-wrap items-center justify-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-1.5",
										phonemes.length === 0 && "opacity-45",
									)}
								>
									{phonemes.map((phoneme) => (
										<VowelSymbolButton
											key={phoneme.symbol}
											phoneme={phoneme}
											onSelect={selectPhoneme}
										/>
									))}
								</div>
							);
						})}
					</Fragment>
				))}
			</div>
		</div>
	);
}

export interface VowelSymbolButtonProps {
	phoneme: VowelPhoneme;
	onSelect: (phoneme: VowelPhoneme) => void;
}

export function VowelSymbolButton({ phoneme, onSelect }: VowelSymbolButtonProps) {
	const isRounded = phoneme.articulation.roundness === "rounded";
	const handleClick = () => onSelect(phoneme);

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"grid place-items-center text-center",
				"min-w-[3.25rem] min-h-[3.25rem] px-2 py-2 rounded-md border",
				"text-lg sm:text-xl font-semibold leading-none tracking-tight transition",
				"hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				isRounded ? "border-primary/40 bg-secondary/30" : "border-border bg-background",
			)}
			aria-label={`Vowel ${phoneme.symbol}`}
		>
			{phoneme.symbol}
		</button>
	);
}
