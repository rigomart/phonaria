"use client";

/**
 * Renders scored sounds on the reveal (#146). `Glyph` is the one atom: every
 * known sound opens the shared phoneme popover; unknown strings fall back to a
 * plain bordered box. `AlignmentDiff` draws the two-line You/Accepted diff for
 * wrong answers; `GlyphSequence` the one-line accepted reading for correct and
 * blank words.
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
								"relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring data-popup-open:border-primary pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
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
				<PhonemePopoverContent phonemeId={key.id} />
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

/** One line of plain glyphs — the accepted reading of a correct or blank word. */
export function GlyphSequence({ sounds }: { sounds: readonly string[] }) {
	return (
		<div className="flex max-w-full items-center gap-1 overflow-x-auto">
			{sounds.map((sound, index) => (
				<Glyph className="bg-background" key={`${index}-${sound}`} sound={sound} />
			))}
		</div>
	);
}

/** Row labels stay pinned while the glyphs scroll under them on narrow screens. */
const rowLabelClass =
	"sticky left-0 z-10 flex w-16 shrink-0 items-center self-stretch bg-background text-muted-foreground text-xs";

export function AlignmentDiff({ ops }: { ops: readonly AlignmentOp[] }) {
	return (
		<div className="flex max-w-full flex-col gap-1 overflow-x-auto">
			{/* `min-w-max` widens each row's own box to the overflowing content —
			    without it the sticky label's containing block stays scrollport-sized
			    and the label scrolls away with the glyphs. */}
			<div className="flex min-w-max items-center gap-1">
				<span className={rowLabelClass}>You</span>
				{ops.map((op, index) => {
					const key = `you-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background" key={key} sound={op.sound} />;
					if (op.kind === "omission")
						return <EmptySlot key={key} label={`You skipped ${soundName(op.target)}`} />;
					if (op.kind === "insertion")
						return (
							<Glyph
								ariaLabel={`You added ${soundName(op.source)} — extra sound`}
								className="border-destructive bg-background text-destructive"
								key={key}
								sound={op.source}
								strike
							/>
						);
					return (
						<Glyph
							ariaLabel={`You said ${soundName(op.source)} — correct sound is ${soundName(op.target)}`}
							className="border-destructive bg-background text-destructive"
							key={key}
							sound={op.source}
							strike
						/>
					);
				})}
			</div>
			<div className="flex min-w-max items-center gap-1">
				<span className={rowLabelClass}>Accepted</span>
				{ops.map((op, index) => {
					const key = `ref-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background-strong" key={key} sound={op.sound} />;
					if (op.kind === "insertion") return <EmptySlot key={key} label="Extra sound" />;
					return (
						<Glyph
							ariaLabel={`Correct sound: ${soundName(op.target)}`}
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
