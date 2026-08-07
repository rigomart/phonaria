"use client";

/**
 * The reveal's single teaching disclosure (#146): collapsed by default, and
 * absent entirely when the topic triggered no notes.
 */
import { ChevronDown, Sparkles } from "lucide-react";
import { useId, useState } from "react";
import type { LessonNote } from "@/lib/practice/topics/types";
import { cn } from "@/lib/utils";

/** Note bodies carry the PRD's `*word*` emphasis verbatim; render it as <em>. */
function renderEmphasis(text: string) {
	return text
		.split(/(\*[^*]+\*)/)
		.map((part, index) =>
			part.startsWith("*") && part.endsWith("*") ? <em key={index}>{part.slice(1, -1)}</em> : part,
		);
}

export function LessonsDisclosure({
	heading,
	notes,
}: {
	heading: string;
	notes: readonly LessonNote[];
}) {
	const [open, setOpen] = useState(false);
	const panelId = useId();

	if (notes.length === 0) return null;

	return (
		<section className="rounded-xl border bg-background">
			<button
				aria-controls={panelId}
				aria-expanded={open}
				className="flex w-full cursor-pointer items-center gap-2 rounded-xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
				onClick={() => setOpen((value) => !value)}
				type="button"
			>
				<Sparkles className="size-4 text-primary" />
				<span className="flex-1 font-display font-semibold">
					{heading}
					<span className="ml-2 font-normal text-muted-foreground text-sm">
						· {notes.length} {notes.length === 1 ? "note" : "notes"}
					</span>
				</span>
				<ChevronDown
					className={cn(
						"size-4 text-muted-foreground transition-transform motion-reduce:transition-none",
						open && "rotate-180",
					)}
				/>
			</button>
			{/* Stays mounted so `aria-controls` always resolves while collapsed; the
			    class toggle (not the `hidden` attribute) wins over `flex`'s display. */}
			<div className={cn("flex-col gap-3 border-t p-4", open ? "flex" : "hidden")} id={panelId}>
				{notes.map((note) => (
					<div className="flex flex-col gap-1" key={note.id}>
						<span className="font-medium text-sm">{note.title}</span>
						<p className="text-muted-foreground text-sm">{renderEmphasis(note.body)}</p>
						<span className="text-muted-foreground text-xs">Seen in: {note.words.join(", ")}</span>
					</div>
				))}
			</div>
		</section>
	);
}
