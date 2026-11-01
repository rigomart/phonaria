import { useId } from "react";
import { type DetailSection, DetailSections } from "./sections";
import { describeSound, type PhonemeDetailsOptions } from "./sound";
import { SoundHeader } from "./sound-header";

/**
 * The full details as a page of their own: the sound's name is the page's h1,
 * a summary line under the header, each section an h2, and on wide screens
 * the sections sit in two columns.
 */
export function PhonemeDetailsPage({
	options,
	summary,
	sections,
}: {
	options: PhonemeDetailsOptions;
	summary?: string;
	sections: readonly DetailSection[];
}) {
	const titleId = useId();

	return (
		<article
			aria-labelledby={titleId}
			data-phoneme-details
			className="flex flex-col gap-10 rounded-3xl bg-popover p-5 sm:p-8"
		>
			<div className="flex flex-col gap-4">
				<SoundHeader
					sound={describeSound({ ...options, showPageLink: false })}
					titleId={titleId}
					titleAs="h1"
					showExample={false}
				/>
				{summary ? <p className="max-w-2xl text-pretty text-foreground">{summary}</p> : null}
			</div>
			<DetailSections targetAccent={options.targetAccent} sections={sections} layout="page" />
		</article>
	);
}
