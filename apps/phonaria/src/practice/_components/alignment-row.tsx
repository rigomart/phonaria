"use client";

/**
 * Renders scored sounds on the reveal (#146). `Glyph` is the one atom: every
 * known sound opens the shared phoneme popover; unknown strings fall back to a
 * plain bordered box. `AlignmentDiff` compares each answer with the dictionary;
 * `GlyphSequence` shows the dictionary reference for blank words.
 */
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import type { AlignmentOp } from "@/lib/practice/scoring";
import { cn } from "@/lib/utils";
import { describeSound, findSound } from "../_lib/sound-palette";

const glyphClass = (strike?: boolean, className?: string) =>
	cn(
		"flex size-8 shrink-0 items-center justify-center rounded-md border font-display text-base leading-none",
		strike && "line-through decoration-2",
		className,
	);

/** Plain-words name for spoken labels; unknown strings fall back to the raw glyph. */
function soundName(sound: string): string {
	const key = findSound(sound);
	return key ? describeSound(key) : sound;
}

export function Glyph({
	sound,
	className,
	strike,
	ariaLabel,
}: {
	/** Phoneme ID; sequences are plain strings by the time they reach here. */
	sound: string;
	className?: string;
	strike?: boolean;
	/** Overrides the default sound description, e.g. to name a diff op. */
	ariaLabel?: string;
}) {
	const key = findSound(sound);

	if (!key) {
		return (
			<span aria-label={ariaLabel ?? sound} className={glyphClass(strike, className)} role="img">
				{sound}
			</span>
		);
	}

	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						aria-label={ariaLabel ?? describeSound(key)}
						className={glyphClass(
							strike,
							cn(
								// Centered coarse-pointer hit-area overlay. Glyphs sit on a
								// 36px pitch (size-8 + gap-1) horizontally, and AlignmentDiff
								// stacks its answer/dictionary rows at the same pitch vertically,
								// so the overlay clamps at 36px on both axes — 44px minimums
								// would overlap neighbours and steal their taps.
								"relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring data-popup-open:border-primary pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-9 pointer-coarse:after:min-w-9",
								className,
							),
						)}
						type="button"
					/>
				}
			>
				{key.ipa}
			</PopoverTrigger>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent targetAccent="en-us" phonemeId={key.id} />
			</PopoverContent>
		</Popover>
	);
}

function EmptySlot({ label }: { label: string }) {
	return (
		<span
			aria-label={label}
			className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground text-xs"
			role="img"
			title={label}
		>
			–
		</span>
	);
}

/** One line of plain glyphs for a dictionary reference. */
export function GlyphSequence({ sounds, label }: { sounds: readonly string[]; label?: string }) {
	return (
		<div className="flex max-w-full items-center gap-1 overflow-x-auto">
			{label ? <span className={rowLabelClass}>{label}</span> : null}
			{sounds.map((sound, index) => (
				<Glyph className="bg-background" key={`${index}-${sound}`} sound={sound} />
			))}
		</div>
	);
}

/** Row labels stay pinned while the glyphs scroll under them on narrow screens. */
const rowLabelClass =
	"sticky left-0 z-10 flex w-24 shrink-0 items-center self-stretch bg-background text-muted-foreground text-xs";

export function AlignmentDiff({ ops }: { ops: readonly AlignmentOp[] }) {
	return (
		<div className="flex max-w-full flex-col gap-1 overflow-x-auto">
			{/* `min-w-max` widens each row's own box to the overflowing content —
			    without it the sticky label's containing block stays scrollport-sized
			    and the label scrolls away with the glyphs. */}
			<div className="flex min-w-max items-center gap-1">
				<span className={rowLabelClass}>Your answer</span>
				{ops.map((op, index) => {
					const key = `you-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background" key={key} sound={op.sound} />;
					if (op.kind === "omission")
						return <EmptySlot key={key} label="No sound in your answer" />;
					if (op.kind === "insertion")
						return (
							<Glyph
								ariaLabel={`Your answer: ${soundName(op.source)}`}
								className="border-destructive bg-background text-destructive"
								key={key}
								sound={op.source}
								strike
							/>
						);
					return (
						<Glyph
							ariaLabel={`Your answer: ${soundName(op.source)}`}
							className="border-destructive bg-background text-destructive"
							key={key}
							sound={op.source}
							strike
						/>
					);
				})}
			</div>
			<div className="flex min-w-max items-center gap-1">
				<span className={rowLabelClass}>Dictionary</span>
				{ops.map((op, index) => {
					const key = `ref-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background-strong" key={key} sound={op.sound} />;
					if (op.kind === "insertion") return <EmptySlot key={key} label="No dictionary sound" />;
					return (
						<Glyph
							ariaLabel={`Dictionary: ${soundName(op.target)}`}
							className="border-success bg-background-strong text-success"
							key={key}
							sound={op.target}
						/>
					);
				})}
			</div>
		</div>
	);
}
