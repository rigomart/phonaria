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

export function Glyph({
	sound,
	className,
	strike,
}: {
	/** Phoneme ID; sequences are plain strings by the time they reach here. */
	sound: string;
	className?: string;
	strike?: boolean;
}) {
	const key = findSound(sound);

	if (!key) {
		return <span className={glyphClass(strike, className)}>{sound}</span>;
	}

	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						aria-label={describeSound(key)}
						className={glyphClass(
							strike,
							cn(
								"cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring data-popup-open:border-primary",
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

export function AlignmentDiff({ ops }: { ops: readonly AlignmentOp[] }) {
	return (
		<div className="flex max-w-full flex-col gap-1 overflow-x-auto">
			<div className="flex items-center gap-1">
				<span className="w-16 shrink-0 text-muted-foreground text-xs">You</span>
				{ops.map((op, index) => {
					const key = `you-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background" key={key} sound={op.sound} />;
					if (op.kind === "omission") return <EmptySlot key={key} label="You skipped this sound" />;
					return (
						<Glyph
							className="border-destructive bg-background text-destructive"
							key={key}
							sound={op.source}
							strike
						/>
					);
				})}
			</div>
			<div className="flex items-center gap-1">
				<span className="w-16 shrink-0 text-muted-foreground text-xs">Accepted</span>
				{ops.map((op, index) => {
					const key = `ref-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background-strong" key={key} sound={op.sound} />;
					if (op.kind === "insertion") return <EmptySlot key={key} label="Extra sound" />;
					return (
						<Glyph
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
