import type { TargetAccent } from "@phonaria/phonetics-data";
import { type CSSProperties, type FocusEvent, useEffect, useRef, useState } from "react";
import { useSwapAnimation } from "@/hooks/use-swap-animation";
import { extractWordIpa } from "@/lib/ipa-copy";
import { orderVariants } from "@/lib/transcription/variant-order";
import type { TranscribedSyllable, TranscribedWord } from "@/lib/types/g2p";
import { cn } from "@/lib/utils";
import { IpaSequence } from "./ipa-sequence";

/** Height of one alternative: text-base line plus py-1. */
const CARD_HEIGHT_PX = 32;
/** How far each card behind the top one peeks out while collapsed. */
const PEEK_PX = 8;
const SCALE_STEP = 0.08;
/** Line spacing of the fanned-out alternatives; tighter than their height. */
const FAN_STEP_PX = 26;
const COLLAPSED_OPACITY = [1, 0.7, 0.45];

interface VariantStackProps {
	targetAccent: TargetAccent;
	word: TranscribedWord;
	selected: number;
	onSelect: (wordIndex: number, variantIndex: number) => void;
}

/**
 * The active variant in front, the word's other variants piled underneath:
 * the top one blurred and faded, the rest behind it, fainter and blurrier.
 * Hovering, tapping, or focusing the pile fans the cards out; choosing one
 * swaps it with the active variant and animates both into place. Cards are
 * keyed by slot, so focus stays on the slot that was clicked.
 */
export function VariantStack({ targetAccent, word, selected, onSelect }: VariantStackProps) {
	const count = word.variants.length;
	const [previousOrder, setPreviousOrder] = useState<number[]>([]);
	const [expanded, setExpanded] = useState(false);
	const pileRef = useRef<HTMLFieldSetElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const order = orderVariants(previousOrder, selected, count);
	const [active, ...alternatives] = order;
	const { track, swap } = useSwapAnimation<number>();

	useEffect(() => {
		if (!expanded) return;
		const collapseOnOutsidePress = (event: PointerEvent) => {
			if (!pileRef.current?.contains(event.target as Node)) setExpanded(false);
		};
		document.addEventListener("pointerdown", collapseOnOutsidePress);
		return () => document.removeEventListener("pointerdown", collapseOnOutsidePress);
	}, [expanded]);

	function choose(variantIndex: number) {
		swap(() => {
			setPreviousOrder(orderVariants(order, variantIndex, count));
			onSelect(word.wordIndex, variantIndex);
		});
	}

	function collapseOnFocusLeave(event: FocusEvent<HTMLFieldSetElement>) {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false);
	}

	return (
		<div className="flex flex-col items-center" data-expanded={expanded || undefined}>
			<div ref={track(active ?? 0)}>
				<IpaSequence
					targetAccent={targetAccent}
					syllables={word.variants[active ?? 0] ?? []}
					wordIndex={word.wordIndex}
				/>
			</div>

			{alternatives.length > 0 ? (
				<fieldset
					ref={pileRef}
					aria-label={`Other pronunciations of ${word.word}`}
					className="relative w-full min-w-0"
					style={{ height: CARD_HEIGHT_PX + (alternatives.length - 1) * PEEK_PX }}
					onPointerEnter={(event) => event.pointerType === "mouse" && setExpanded(true)}
					onPointerLeave={(event) => event.pointerType === "mouse" && setExpanded(false)}
					onBlur={collapseOnFocusLeave}
					onKeyDown={(event) => {
						if (event.key !== "Escape" || !expanded) return;
						setExpanded(false);
						toggleRef.current?.focus();
					}}
				>
					<button
						ref={toggleRef}
						type="button"
						aria-expanded={expanded}
						aria-label={`${expanded ? "Hide" : "Show"} other pronunciations of ${word.word}`}
						onClick={() => setExpanded((open) => !open)}
						className={cn(
							"absolute inset-0 z-40 rounded-lg cursor-pointer",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							expanded && "pointer-events-none",
						)}
					/>
					<ul inert={!expanded}>
						{alternatives.map((variantIndex, slot) => (
							<li key={slot}>
								<button
									type="button"
									onClick={() => choose(variantIndex)}
									aria-label={`Use pronunciation /${extractWordIpa(word, variantIndex)}/`}
									style={cardStyle(slot, expanded)}
									className={cn(
										"absolute left-1/2 top-0 origin-top whitespace-nowrap cursor-pointer",
										"rounded-lg px-3 py-1 text-base text-muted-foreground hover:text-foreground",
										"transition-[transform,opacity,color] duration-300 ease-out motion-reduce:transition-none",
										// Page-coloured while fanned out, so the cards hide the text beneath them.
										expanded ? "bg-background" : "bg-transparent",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:text-foreground",
									)}
								>
									<span
										ref={track(variantIndex)}
										className="inline-block transition-[opacity,filter] duration-300 motion-reduce:transition-none"
										style={expanded ? undefined : { opacity: 0.45, filter: `blur(${1 + slot}px)` }}
									>
										<FadedVariant syllables={word.variants[variantIndex] ?? []} />
									</span>
								</button>
							</li>
						))}
					</ul>
				</fieldset>
			) : null}
		</div>
	);
}

function cardStyle(slot: number, expanded: boolean): CSSProperties {
	if (expanded) {
		return {
			transform: `translate(-50%, ${slot * FAN_STEP_PX}px)`,
			zIndex: 30 - slot,
		};
	}
	return {
		transform: `translate(-50%, ${slot * PEEK_PX}px) scale(${1 - slot * SCALE_STEP})`,
		opacity: COLLAPSED_OPACITY[slot] ?? COLLAPSED_OPACITY.at(-1),
		zIndex: 30 - slot,
	};
}

function FadedVariant({ syllables }: { syllables: TranscribedSyllable[] }) {
	return syllables.map((syllable, syllableIndex) => {
		const stress = syllable.stress === "primary" ? "ˈ" : syllable.stress === "secondary" ? "ˌ" : "";
		const key = `${syllableIndex}-${syllable.phonemes.map((p) => p.symbol).join("")}`;
		return (
			<span key={key}>
				{stress}
				{syllable.phonemes.map((p) => p.symbol).join("")}
				{syllableIndex < syllables.length - 1 ? <span className="mx-0.5">·</span> : null}
			</span>
		);
	});
}
