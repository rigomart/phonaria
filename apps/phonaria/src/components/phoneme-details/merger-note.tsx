import { type MergerNote as MergerNoteData, splitMergerNoteText } from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { DetailsCard } from "./details-section";

/** A merger note's text, its example words in italics and its sounds in the IPA face. */
export function MergerNote({ note }: { note: MergerNoteData }) {
	const segments = splitMergerNoteText(note.text);
	return (
		<DetailsCard>
			<p className="text-pretty text-sm text-foreground">
				{segments.map(({ text, kind }, index) => {
					// The text is fixed, so a segment's position identifies it.
					const key = `${index}-${text}`;
					if (kind === "word") return <em key={key}>{text}</em>;
					if (kind === "sound") {
						return (
							<span key={key} className="font-display">
								/{text}/
							</span>
						);
					}
					return <Fragment key={key}>{text}</Fragment>;
				})}
			</p>
		</DetailsCard>
	);
}
