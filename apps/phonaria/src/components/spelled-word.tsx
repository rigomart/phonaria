import { splitSpelledWord } from "@phonaria/phonetics-data";
import { Fragment } from "react";

/** Emphasizes the letters that spell the sound, e.g. "ha[pp]y". */
export function SpelledWord({ spelled }: { spelled: string }) {
	let offset = 0;
	return splitSpelledWord(spelled).map(({ text, highlighted }) => {
		const key = offset;
		offset += text.length;
		return highlighted ? (
			<mark key={key} className="bg-transparent font-semibold text-foreground">
				{text}
			</mark>
		) : (
			<Fragment key={key}>{text}</Fragment>
		);
	});
}
