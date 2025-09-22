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
			<div className="inline-grid w-full min-w-max gap-2 grid-cols-[auto_repeat(5,minmax(5rem,1fr))]">
				<div />
				{FRONTNESS_ORDER.map((frontness) => (
					<div
						key={frontness}
						className="px-2 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground"
					>
						{FRONTNESS_LABELS[frontness]}
					</div>
				))}

				{HEIGHT_ORDER.map((height) => (
					<Fragment key={height}>
						<div className="flex items-center justify-end pr-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
							{HEIGHT_LABELS[height]}
						</div>
						{FRONTNESS_ORDER.map((frontness) => {
							const key = `${height}-${frontness}`;
							const phonemes = cells.get(key) ?? [];

							return (
								<div
									key={frontness}
									className={cn(
										"flex min-h-[3.75rem] flex-wrap items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-card/60 p-2",
										phonemes.length === 0 && "opacity-40",
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
				"flex h-10 min-w-[2.5rem] items-center justify-center border text-lg font-semibold transition",
				"hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				isRounded
					? "rounded-full border-primary/40 bg-secondary/30"
					: "rounded-md border-border bg-background",
			)}
			aria-label={`Vowel ${phoneme.symbol}`}
		>
			{phoneme.symbol}
		</button>
	);
}
