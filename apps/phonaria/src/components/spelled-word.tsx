import { splitSpelledWord } from "@phonaria/phonetics-data";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Emphasizes the letters that spell the sound, e.g. "ha[pp]y". `markClassName`
 * adjusts the emphasis where the word sits on another surface.
 */
export function SpelledWord({
	spelled,
	markClassName,
}: {
	spelled: string;
	markClassName?: string;
}) {
	let offset = 0;
	return splitSpelledWord(spelled).map(({ text, highlighted }) => {
		const key = offset;
		offset += text.length;
		return highlighted ? (
			<mark key={key} className={cn("bg-transparent font-semibold text-foreground", markClassName)}>
				{text}
			</mark>
		) : (
			<Fragment key={key}>{text}</Fragment>
		);
	});
}
