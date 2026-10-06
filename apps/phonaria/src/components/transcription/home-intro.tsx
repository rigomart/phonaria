"use client";

import { type EnglishPhonemeSymbolId, getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { RotateCcw } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCurrentTranscription } from "@/hooks/use-transcribe";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import { shouldShowTranscriptionEmptyState } from "@/lib/transcription/search";
import { cn } from "@/lib/utils";
import { PhonemePopoverButton } from "./display/clickable-phoneme";
import { prefersReducedMotion } from "./display/ipa-morph";

/** /fəˈnɑɹiə/, by letter group. */
const NAME_PRONUNCIATION = [
	{ spelling: "Ph", phonemeId: "F" },
	{ spelling: "o", phonemeId: "AX" },
	{ spelling: "n", phonemeId: "N", stressed: true },
	{ spelling: "a", phonemeId: "A" },
	{ spelling: "r", phonemeId: "R" },
	{ spelling: "i", phonemeId: "I" },
	{ spelling: "a", phonemeId: "AX" },
] as const satisfies readonly {
	spelling: string;
	phonemeId: EnglishPhonemeSymbolId;
	stressed?: boolean;
}[];

const NAME_IPA = NAME_PRONUNCIATION.map(
	(segment) => `${"stressed" in segment ? "ˈ" : ""}${getIpaForPhonemeId(segment.phonemeId)}`,
).join("");

// Milliseconds. MORPH_START waits out the name's 700 ms entrance.
const MORPH_START = 900;
const MORPH_STEP = 120;
const SOUND_LAG = 140;
const CAPTION_LAG = 380;
const TURN_MS = 500;
const MORPH_END = MORPH_START + NAME_PRONUNCIATION.length * MORPH_STEP + CAPTION_LAG;
const SETTLE_AT =
	MORPH_START + (NAME_PRONUNCIATION.length - 1) * MORPH_STEP + SOUND_LAG + TURN_MS + 100;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";
const FOLD_MS = 500;

/**
 * `waiting` lasts until hydration and the IPA font, so the morph measures
 * widths in its final fonts. Reduced motion skips `playing`.
 */
type Phase = "waiting" | "playing" | "settled";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

/** Same classes in `playing` and `settled`, so a running entrance isn't restarted. */
function reveal(phase: Phase, entrance: string): string {
	if (phase === "waiting") return "opacity-0";
	return cn("animate-in fade-in fill-mode-both motion-reduce:animate-none", entrance);
}

function revealDelay(phase: Phase, ms: number) {
	return phase === "waiting" ? undefined : delay(ms);
}

/** Settles on load or failure. No timeout: the plain name holds the space meanwhile. */
function whenFontsReady(): Promise<void> {
	return Promise.all([
		document.fonts.load('500 1em "Sora Variable"', "Phonaria"),
		document.fonts.load('400 1em "Noto Sans Variable"', `/${NAME_IPA}/`),
	]).then(
		() => undefined,
		() => undefined,
	);
}

/** Unmounts after folding, so only the result's phoneme buttons stay on the page. */
export function HomeIntro({ query }: { query: string | undefined }) {
	const { data: result } = useCurrentTranscription();
	const lookupError = useG2PStore((s) => s.lookupError);
	const open = shouldShowTranscriptionEmptyState({
		q: query,
		hasResult: Boolean(result),
		hasError: lookupError !== null,
	});
	const [folding, setFolding] = useState(false);
	const [playCount, setPlayCount] = useState(0);

	useEffect(() => {
		if (open) return;
		setFolding(true);
		const timer = window.setTimeout(() => setFolding(false), FOLD_MS);
		return () => window.clearTimeout(timer);
	}, [open]);

	return (
		<div
			inert={!open}
			className={cn(
				"grid w-full transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
				open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
			)}
		>
			<div className="min-h-0 overflow-hidden">
				{open || folding ? (
					<NamePronunciation key={playCount} onReplay={() => setPlayCount((count) => count + 1)} />
				) : null}
			</div>
		</div>
	);
}

function NamePronunciation({ onReplay }: { onReplay: () => void }) {
	const [phase, setPhase] = useState<Phase>("waiting");

	useEffect(() => {
		let cancelled = false;
		let settleTimer: number | undefined;
		void whenFontsReady().then(() => {
			if (cancelled) return;
			if (prefersReducedMotion()) {
				setPhase("settled");
				return;
			}
			setPhase("playing");
			settleTimer = window.setTimeout(() => setPhase("settled"), SETTLE_AT);
		});
		return () => {
			cancelled = true;
			window.clearTimeout(settleTimer);
		};
	}, []);

	return (
		<section
			aria-labelledby="home-intro-heading"
			className="flex flex-col items-center gap-6 px-4 pb-8 md:pb-10"
		>
			<h1 id="home-intro-heading" className="sr-only">
				Phonaria
			</h1>

			{/* CSS, so it plays before hydration. */}
			<figure className="relative flex items-start pb-8 animate-in fade-in blur-in-sm slide-in-from-bottom-2 duration-700 ease-out motion-reduce:animate-none">
				<figcaption className="sr-only">Phonaria is pronounced /{NAME_IPA}/</figcaption>
				<Slash phase={phase} className="right-full" />
				{NAME_PRONUNCIATION.map((segment, index) => (
					<NameSegment
						// Static list, and "a" → /ə/ repeats.
						key={index}
						phase={phase}
						spelling={segment.spelling}
						phonemeId={segment.phonemeId}
						stressed={"stressed" in segment}
						turnAt={MORPH_START + index * MORPH_STEP}
					/>
				))}
				<Slash phase={phase} className="left-full" />
			</figure>

			<div
				className={cn(
					"flex items-center gap-1",
					reveal(phase, "slide-in-from-bottom-1 duration-500"),
				)}
				style={revealDelay(phase, MORPH_END + 200)}
			>
				<p className="text-sm text-muted-foreground">
					Tap a sound to hear it and see how it's made
				</p>
				<Button
					variant="ghost"
					size="icon-xs"
					className="text-muted-foreground hover:text-foreground"
					aria-label="Replay the animation"
					onClick={onReplay}
				>
					<RotateCcw />
				</Button>
			</div>
		</section>
	);
}

/** The sound stays out of flow until settled, so the plain name keeps its own spacing. */
function NameSegment({
	phase,
	spelling,
	phonemeId,
	stressed,
	turnAt,
}: {
	phase: Phase;
	spelling: string;
	phonemeId: EnglishPhonemeSymbolId;
	stressed: boolean;
	turnAt: number;
}) {
	const symbol = getIpaForPhonemeId(phonemeId);
	const columnRef = useRef<HTMLDivElement>(null);
	const lettersRef = useRef<HTMLSpanElement>(null);
	const soundRef = useRef<HTMLSpanElement>(null);

	useLayoutEffect(() => {
		const column = columnRef.current;
		const letters = lettersRef.current;
		const sound = soundRef.current;
		if (phase !== "playing" || !column || !letters || !sound) return;

		const animation = column.animate(
			[{ width: `${letters.offsetWidth}px` }, { width: `${sound.offsetWidth}px` }],
			{ duration: TURN_MS, delay: turnAt, easing: EASING, fill: "both" },
		);
		return () => animation.cancel();
	}, [phase, turnAt]);

	return (
		<div
			ref={columnRef}
			className="group relative flex justify-center text-5xl sm:text-6xl md:text-7xl"
		>
			<span
				ref={lettersRef}
				aria-hidden="true"
				className={cn(
					"whitespace-nowrap font-display font-medium leading-tight",
					phase === "playing" &&
						"animate-out fade-out blur-out-sm slide-out-to-bottom-3/4 zoom-out-25 fill-mode-forwards duration-500 ease-in",
					phase === "settled" && "hidden",
				)}
				style={phase === "playing" ? delay(turnAt) : undefined}
			>
				{spelling}
			</span>

			<span
				ref={soundRef}
				className={cn(
					// Flex drops the inline strut, so settling keeps the column's height.
					"flex whitespace-nowrap",
					phase !== "settled" && "absolute top-0 left-1/2 -translate-x-1/2",
					phase === "waiting" && "opacity-0",
					phase === "playing" &&
						"animate-in fade-in blur-in-md slide-in-from-top-1/4 fill-mode-both duration-500 ease-out",
				)}
				style={phase === "playing" ? delay(turnAt + SOUND_LAG) : undefined}
			>
				<PhonemePopoverButton
					targetAccent="en-us"
					phonemeId={phonemeId}
					symbol={symbol}
					className="px-1 py-0 leading-tight"
				/>
			</span>

			{stressed ? (
				<span
					aria-hidden="true"
					className={cn(
						"absolute top-0 left-0 -translate-x-1/2 leading-tight text-muted-foreground select-none",
						reveal(phase, "duration-500"),
					)}
					style={revealDelay(phase, turnAt + SOUND_LAG + 200)}
				>
					ˈ
				</span>
			) : null}

			<span
				aria-hidden="true"
				className={cn(
					"absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-base text-muted-foreground transition-colors group-hover:text-foreground group-has-data-popup-open:text-foreground",
					reveal(phase, "duration-300"),
				)}
				style={revealDelay(phase, turnAt + CAPTION_LAG)}
			>
				{spelling.toLowerCase()}
			</span>
		</div>
	);
}

function Slash({ phase, className }: { phase: Phase; className: string }) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"absolute top-0 px-1 text-5xl sm:text-6xl md:text-7xl font-light leading-tight text-muted-foreground select-none",
				reveal(phase, "duration-700"),
				className,
			)}
			style={revealDelay(phase, MORPH_END)}
		>
			/
		</span>
	);
}
