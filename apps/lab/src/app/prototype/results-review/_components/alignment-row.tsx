"use client";

/**
 * PROTOTYPE ONLY — throwaway. Renders #133's alignment operations as a row of
 * columns: your sound on top, the accepted sound underneath. The one shared atom
 * across all three variants, so the diff language stays constant while the page
 * structure varies.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { PhonemePopoverContent } from "@/components/phoneme-popover-content";
import { cn } from "@/lib/utils";
import { getPaletteKey } from "../../round-building/_lib/palette";
import type { AlignmentOp } from "../_lib/results";

export function Glyph({
	id,
	className,
	strike,
}: {
	id: EnglishPhonemeSymbolId;
	className?: string;
	strike?: boolean;
}) {
	const key = getPaletteKey(id);
	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						aria-label={`Details for ${key.ipa}`}
						className={cn(
							"flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border font-display text-base leading-none data-popup-open:border-primary",
							strike && "line-through decoration-2",
							className,
						)}
						type="button"
					/>
				}
			>
				{key.ipa}
			</PopoverTrigger>
			<PopoverContent sideOffset={8}>
				<PhonemePopoverContent phonemeId={id} />
			</PopoverContent>
		</Popover>
	);
}

function EmptySlot({ label }: { label: string }) {
	return (
		<span
			className="flex size-8 items-center justify-center rounded-md border border-dashed text-muted-foreground text-xs"
			title={label}
		>
			–
		</span>
	);
}

/**
 * One line per word: matches are plain accepted glyphs; a substitution stacks
 * the struck learner glyph over the correct one inside the line; an omission is
 * the missed sound in green over a dashed empty slot. The row only grows where
 * a mistake is.
 */
export function DenseAlignmentRow({ ops }: { ops: AlignmentOp[] }) {
	return (
		<div className="flex max-w-full items-end gap-1 overflow-x-auto">
			{ops.map((op, index) => {
				const key = `${index}-${op.kind}`;
				if (op.kind === "match") return <Glyph className="bg-background" id={op.sound} key={key} />;
				if (op.kind === "substitution")
					return (
						<span className="flex flex-col gap-0.5" key={key}>
							<Glyph
								className="size-6 border-destructive text-destructive text-xs"
								id={op.learner}
								strike
							/>
							<Glyph className="border-success bg-background-strong text-success" id={op.target} />
						</span>
					);
				if (op.kind === "insertion")
					return (
						<Glyph
							className="border-destructive bg-background text-destructive"
							id={op.learner}
							key={key}
							strike
						/>
					);
				return (
					<span className="flex flex-col gap-0.5" key={key}>
						<span className="flex size-6 items-center justify-center rounded-md border border-dashed text-muted-foreground text-xs">
							–
						</span>
						<Glyph className="border-success bg-background-strong text-success" id={op.target} />
					</span>
				);
			})}
		</div>
	);
}

/**
 * `compact` renders the accepted row only (used when the learner's answer was
 * correct or blank — there is no diff to draw).
 */
export function AlignmentRow({ ops, compact }: { ops: AlignmentOp[]; compact?: boolean }) {
	if (compact) {
		return (
			<div className="flex flex-wrap items-center gap-1">
				{ops.map((op, index) =>
					op.kind === "insertion" ? null : (
						<Glyph
							className="bg-background"
							id={op.kind === "match" ? op.sound : op.target}
							key={`${index}-${op.kind}`}
						/>
					),
				)}
			</div>
		);
	}

	return (
		<div className="flex max-w-full flex-col gap-1 overflow-x-auto">
			<div className="flex items-center gap-1">
				<span className="w-14 shrink-0 text-muted-foreground text-xs">You</span>
				{ops.map((op, index) => {
					const key = `you-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background" id={op.sound} key={key} />;
					if (op.kind === "substitution")
						return (
							<Glyph
								className="border-destructive bg-background text-destructive"
								id={op.learner}
								key={key}
								strike
							/>
						);
					if (op.kind === "insertion")
						return (
							<Glyph
								className="border-destructive bg-background text-destructive"
								id={op.learner}
								key={key}
								strike
							/>
						);
					return <EmptySlot key={key} label="You skipped this sound" />;
				})}
			</div>
			<div className="flex items-center gap-1">
				<span className="w-14 shrink-0 text-muted-foreground text-xs">Accepted</span>
				{ops.map((op, index) => {
					const key = `ref-${index}`;
					if (op.kind === "match")
						return <Glyph className="bg-background-strong" id={op.sound} key={key} />;
					if (op.kind === "insertion") return <EmptySlot key={key} label="Extra sound" />;
					return (
						<Glyph
							className="border-success bg-background-strong text-success"
							id={op.target}
							key={key}
						/>
					);
				})}
			</div>
		</div>
	);
}
