"use client";

/**
 * The reveal's single teaching disclosure (#146): collapsed by default, and
 * absent entirely when the topic triggered no notes.
 */
import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import type { LessonNote } from "@/lib/practice/topics/types";
import { cn } from "@/lib/utils";

/** Note bodies carry the PRD's `*word*` emphasis verbatim; render it as <em>. */
function renderEmphasis(text: string) {
	return text.split(/(\*[^*]+\*)/).map((part, index) =>
		part.startsWith("*") && part.endsWith("*") ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: segments are static copy
			<em key={index}>{part.slice(1, -1)}</em>
		) : (
			part
		),
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

	if (notes.length === 0) return null;

	return (
		<section className="rounded-xl border bg-background">
			<button
				aria-expanded={open}
				className="flex w-full cursor-pointer items-center gap-2 p-4 text-left"
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
					className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
				/>
			</button>
			{open && (
				<div className="flex flex-col gap-3 border-t p-4">
					{notes.map((note) => (
						<div className="flex flex-col gap-1" key={note.id}>
							<span className="font-medium text-sm">{note.title}</span>
							<p className="text-muted-foreground text-sm">{renderEmphasis(note.body)}</p>
							<span className="text-muted-foreground text-xs">
								Seen in: {note.words.join(", ")}
							</span>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
