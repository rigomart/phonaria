import { useId } from "react";
import { DetailSections, getDetailSections } from "./sections";
import { describeSound, type PhonemeDetailsOptions } from "./sound";
import { SoundHeader } from "./sound-header";

/**
 * The full details as a page of their own: the sound's name is the page's h1,
 * each section an h2, and on wide screens the sections sit in two columns.
 */
export function PhonemeDetailsPage({ options }: { options: PhonemeDetailsOptions }) {
	const titleId = useId();

	return (
		<article
			aria-labelledby={titleId}
			data-phoneme-details
			className="flex flex-col gap-10 rounded-3xl bg-popover p-5 sm:p-8"
		>
			<SoundHeader
				sound={describeSound(options)}
				titleId={titleId}
				titleAs="h1"
				showExample={false}
			/>
			<DetailSections
				targetAccent={options.targetAccent}
				sections={getDetailSections(options)}
				layout="page"
			/>
		</article>
	);
}
